import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';
import { db } from '../db';

const execAsync = promisify(exec);

export interface BackupConfig {
  schedule: string; // cron format
  retention: number; // days
  storageType: 'local' | 's3' | 'azure' | 'gcp';
  encryptionKey?: string;
  notificationChannels: string[];
}

export interface BackupMetadata {
  id: string;
  timestamp: Date;
  type: 'full' | 'incremental';
  size: number;
  duration: number;
  status: 'success' | 'failed' | 'partial';
  location: string;
  checksum: string;
}

export class BackupService {
  private static instance: BackupService;
  private config: BackupConfig;
  private backupHistory: BackupMetadata[] = [];

  constructor(config: BackupConfig) {
    this.config = config;
    this.initializeBackupSchedule();
  }

  public static getInstance(config?: BackupConfig): BackupService {
    if (!BackupService.instance) {
      if (!config) {
        throw new Error('BackupService requires initial configuration');
      }
      BackupService.instance = new BackupService(config);
    }
    return BackupService.instance;
  }

  // Initialize automatic backup schedule
  private initializeBackupSchedule(): void {
    // Full backup daily at 2 AM
    this.scheduleBackup('0 2 * * *', 'full');
    
    // Incremental backup every 4 hours
    this.scheduleBackup('0 */4 * * *', 'incremental');
    
    // Cleanup old backups weekly
    this.scheduleBackup('0 1 * * 0', 'cleanup');
  }

  // Schedule backup using cron-like syntax
  private scheduleBackup(schedule: string, type: 'full' | 'incremental' | 'cleanup'): void {
    const [minute, hour, day, month, dayOfWeek] = schedule.split(' ');
    
    setInterval(() => {
      const now = new Date();
      if (this.shouldRunBackup(now, { minute, hour, day, month, dayOfWeek })) {
        switch (type) {
          case 'full':
            this.performFullBackup();
            break;
          case 'incremental':
            this.performIncrementalBackup();
            break;
          case 'cleanup':
            this.cleanupOldBackups();
            break;
        }
      }
    }, 60000); // Check every minute
  }

  // Check if backup should run based on schedule
  private shouldRunBackup(now: Date, schedule: any): boolean {
    // Simplified cron matching - in production, use a proper cron library
    const matches = {
      minute: schedule.minute === '*' || parseInt(schedule.minute) === now.getMinutes(),
      hour: schedule.hour === '*' || parseInt(schedule.hour) === now.getHours(),
      day: schedule.day === '*' || parseInt(schedule.day) === now.getDate(),
      month: schedule.month === '*' || parseInt(schedule.month) === now.getMonth() + 1,
      dayOfWeek: schedule.dayOfWeek === '*' || parseInt(schedule.dayOfWeek) === now.getDay(),
    };
    
    return Object.values(matches).every(match => match);
  }

  // Perform full database backup
  public async performFullBackup(): Promise<BackupMetadata> {
    const startTime = Date.now();
    const backupId = `full_${Date.now()}`;
    const timestamp = new Date();

    try {
      console.log(`Starting full backup: ${backupId}`);

      // Create backup directory
      const backupDir = path.join('/app/backups', backupId);
      await fs.mkdir(backupDir, { recursive: true });

      // Database backup
      const dbBackupPath = path.join(backupDir, 'database.sql');
      await this.backupDatabase(dbBackupPath);

      // Files backup (logs, uploads, etc.)
      const filesBackupPath = path.join(backupDir, 'files.tar.gz');
      await this.backupFiles(filesBackupPath);

      // Configuration backup
      const configBackupPath = path.join(backupDir, 'config.json');
      await this.backupConfiguration(configBackupPath);

      // Calculate backup size and checksum
      const size = await this.getDirectorySize(backupDir);
      const checksum = await this.calculateChecksum(backupDir);

      // Encrypt if configured
      if (this.config.encryptionKey) {
        await this.encryptBackup(backupDir);
      }

      // Upload to cloud storage
      const location = await this.uploadBackup(backupDir);

      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size,
        duration,
        status: 'success',
        location,
        checksum,
      };

      this.backupHistory.push(metadata);
      await this.notifyBackupComplete(metadata);

      console.log(`Full backup completed: ${backupId} (${duration}ms, ${size} bytes)`);
      return metadata;

    } catch (error) {
      console.error(`Full backup failed: ${backupId}`, error);
      
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        location: '',
        checksum: '',
      };

      this.backupHistory.push(metadata);
      await this.notifyBackupFailed(metadata, error as Error);
      
      throw error;
    }
  }

  // Perform incremental backup
  public async performIncrementalBackup(): Promise<BackupMetadata> {
    const startTime = Date.now();
    const backupId = `incremental_${Date.now()}`;
    const timestamp = new Date();

    try {
      console.log(`Starting incremental backup: ${backupId}`);

      const lastBackup = this.getLastSuccessfulBackup();
      const cutoffTime = lastBackup ? lastBackup.timestamp : new Date(0);

      // Create backup directory
      const backupDir = path.join('/app/backups', backupId);
      await fs.mkdir(backupDir, { recursive: true });

      // Incremental database backup (changes since last backup)
      const dbBackupPath = path.join(backupDir, 'database_incremental.sql');
      await this.backupDatabaseIncremental(dbBackupPath, cutoffTime);

      // Changed files backup
      const filesBackupPath = path.join(backupDir, 'files_incremental.tar.gz');
      await this.backupChangedFiles(filesBackupPath, cutoffTime);

      const size = await this.getDirectorySize(backupDir);
      const checksum = await this.calculateChecksum(backupDir);
      const location = await this.uploadBackup(backupDir);

      const duration = Date.now() - startTime;
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size,
        duration,
        status: 'success',
        location,
        checksum,
      };

      this.backupHistory.push(metadata);
      console.log(`Incremental backup completed: ${backupId} (${duration}ms, ${size} bytes)`);
      return metadata;

    } catch (error) {
      console.error(`Incremental backup failed: ${backupId}`, error);
      throw error;
    }
  }

  // Backup database to SQL file
  private async backupDatabase(outputPath: string): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Parse database URL
    const url = new URL(dbUrl);
    const command = `pg_dump -h ${url.hostname} -p ${url.port || 5432} -U ${url.username} -d ${url.pathname.slice(1)} > ${outputPath}`;
    
    // Set password via environment
    const env = { ...process.env, PGPASSWORD: url.password };
    
    await execAsync(command, { env });
  }

  // Incremental database backup using WAL files
  private async backupDatabaseIncremental(outputPath: string, since: Date): Promise<void> {
    // This would use PostgreSQL WAL (Write-Ahead Logging) for incremental backups
    // For simplicity, we'll do a modified full backup with date filtering
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    const url = new URL(dbUrl);
    const sinceStr = since.toISOString();
    
    // Backup only changed records (simplified approach)
    const tables = ['children', 'staff', 'attendance', 'messages', 'alerts'];
    let backupContent = '';
    
    for (const table of tables) {
      const command = `pg_dump -h ${url.hostname} -p ${url.port || 5432} -U ${url.username} -d ${url.pathname.slice(1)} -t ${table} --where="updated_at >= '${sinceStr}'" --inserts`;
      const env = { ...process.env, PGPASSWORD: url.password };
      
      try {
        const { stdout } = await execAsync(command, { env });
        backupContent += stdout + '\n';
      } catch (error) {
        console.warn(`No changes in table ${table} since ${sinceStr}`);
      }
    }
    
    await fs.writeFile(outputPath, backupContent);
  }

  // Backup application files
  private async backupFiles(outputPath: string): Promise<void> {
    const filesToBackup = [
      '/app/logs',
      '/app/uploads',
      '/app/config',
    ];
    
    const command = `tar -czf ${outputPath} ${filesToBackup.filter(path => this.pathExists(path)).join(' ')}`;
    await execAsync(command);
  }

  // Backup changed files since timestamp
  private async backupChangedFiles(outputPath: string, since: Date): Promise<void> {
    const sinceStr = Math.floor(since.getTime() / 1000); // Unix timestamp
    const command = `find /app/logs /app/uploads -type f -newer /tmp/timestamp_${sinceStr} -exec tar -czf ${outputPath} {} +`;
    
    // Create timestamp reference file
    await execAsync(`touch -t ${sinceStr} /tmp/timestamp_${sinceStr}`);
    
    try {
      await execAsync(command);
    } catch (error) {
      // No files changed - create empty archive
      await execAsync(`tar -czf ${outputPath} -T /dev/null`);
    }
  }

  // Backup configuration
  private async backupConfiguration(outputPath: string): Promise<void> {
    const config = {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      timestamp: new Date().toISOString(),
      settings: {
        // Include non-sensitive configuration
        features: await this.getFeatureFlags(),
        compliance: await this.getComplianceSettings(),
      },
    };
    
    await fs.writeFile(outputPath, JSON.stringify(config, null, 2));
  }

  // Check if path exists
  private pathExists(path: string): boolean {
    try {
      require('fs').accessSync(path);
      return true;
    } catch {
      return false;
    }
  }

  // Calculate directory size
  private async getDirectorySize(dirPath: string): Promise<number> {
    const { stdout } = await execAsync(`du -sb ${dirPath} | cut -f1`);
    return parseInt(stdout.trim());
  }

  // Calculate backup checksum
  private async calculateChecksum(dirPath: string): Promise<string> {
    const { stdout } = await execAsync(`find ${dirPath} -type f -exec md5sum {} + | sort | md5sum | cut -d' ' -f1`);
    return stdout.trim();
  }

  // Encrypt backup directory
  private async encryptBackup(dirPath: string): Promise<void> {
    if (!this.config.encryptionKey) return;
    
    const tarPath = `${dirPath}.tar.gz`;
    const encryptedPath = `${dirPath}.tar.gz.enc`;
    
    // Create encrypted archive
    await execAsync(`tar -czf ${tarPath} -C ${path.dirname(dirPath)} ${path.basename(dirPath)}`);
    await execAsync(`openssl enc -aes-256-cbc -salt -in ${tarPath} -out ${encryptedPath} -k "${this.config.encryptionKey}"`);
    
    // Remove unencrypted files
    await execAsync(`rm -rf ${dirPath} ${tarPath}`);
  }

  // Upload backup to cloud storage
  private async uploadBackup(backupDir: string): Promise<string> {
    switch (this.config.storageType) {
      case 's3':
        return this.uploadToS3(backupDir);
      case 'azure':
        return this.uploadToAzure(backupDir);
      case 'gcp':
        return this.uploadToGCP(backupDir);
      default:
        return backupDir; // Local storage
    }
  }

  // Upload to AWS S3
  private async uploadToS3(backupDir: string): Promise<string> {
    const bucketName = process.env.S3_BACKUP_BUCKET;
    if (!bucketName) {
      throw new Error('S3_BACKUP_BUCKET not configured');
    }
    
    const tarPath = `${backupDir}.tar.gz`;
    await execAsync(`tar -czf ${tarPath} -C ${path.dirname(backupDir)} ${path.basename(backupDir)}`);
    
    const s3Key = `backups/${path.basename(backupDir)}.tar.gz`;
    await execAsync(`aws s3 cp ${tarPath} s3://${bucketName}/${s3Key}`);
    
    return `s3://${bucketName}/${s3Key}`;
  }

  // Upload to Azure Blob Storage
  private async uploadToAzure(backupDir: string): Promise<string> {
    // Implementation for Azure Blob Storage
    throw new Error('Azure upload not implemented yet');
  }

  // Upload to Google Cloud Storage
  private async uploadToGCP(backupDir: string): Promise<string> {
    // Implementation for Google Cloud Storage
    throw new Error('GCP upload not implemented yet');
  }

  // Restore from backup
  public async restoreFromBackup(backupId: string): Promise<void> {
    const backup = this.backupHistory.find(b => b.id === backupId && b.status === 'success');
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    console.log(`Starting restore from backup: ${backupId}`);

    try {
      // Download backup if needed
      const localPath = await this.downloadBackup(backup);
      
      // Decrypt if needed
      const extractPath = await this.decryptBackup(localPath);
      
      // Restore database
      await this.restoreDatabase(path.join(extractPath, 'database.sql'));
      
      // Restore files
      await this.restoreFiles(path.join(extractPath, 'files.tar.gz'));
      
      console.log(`Restore completed: ${backupId}`);
      
    } catch (error) {
      console.error(`Restore failed: ${backupId}`, error);
      throw error;
    }
  }

  // Download backup from cloud storage
  private async downloadBackup(backup: BackupMetadata): Promise<string> {
    if (backup.location.startsWith('s3://')) {
      const localPath = `/tmp/${backup.id}.tar.gz`;
      await execAsync(`aws s3 cp ${backup.location} ${localPath}`);
      return localPath;
    }
    
    return backup.location; // Already local
  }

  // Decrypt backup
  private async decryptBackup(encryptedPath: string): Promise<string> {
    if (!this.config.encryptionKey || !encryptedPath.endsWith('.enc')) {
      return encryptedPath;
    }
    
    const decryptedPath = encryptedPath.replace('.enc', '');
    await execAsync(`openssl enc -aes-256-cbc -d -in ${encryptedPath} -out ${decryptedPath} -k "${this.config.encryptionKey}"`);
    
    const extractPath = decryptedPath.replace('.tar.gz', '');
    await execAsync(`tar -xzf ${decryptedPath} -C ${path.dirname(extractPath)}`);
    
    return extractPath;
  }

  // Restore database
  private async restoreDatabase(sqlPath: string): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    const url = new URL(dbUrl);
    const command = `psql -h ${url.hostname} -p ${url.port || 5432} -U ${url.username} -d ${url.pathname.slice(1)} < ${sqlPath}`;
    const env = { ...process.env, PGPASSWORD: url.password };
    
    await execAsync(command, { env });
  }

  // Restore files
  private async restoreFiles(tarPath: string): Promise<void> {
    await execAsync(`tar -xzf ${tarPath} -C /`);
  }

  // Clean up old backups
  public async cleanupOldBackups(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retention);

    const oldBackups = this.backupHistory.filter(b => b.timestamp < cutoffDate);
    
    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup);
        this.backupHistory = this.backupHistory.filter(b => b.id !== backup.id);
        console.log(`Deleted old backup: ${backup.id}`);
      } catch (error) {
        console.error(`Failed to delete backup: ${backup.id}`, error);
      }
    }
  }

  // Delete backup
  private async deleteBackup(backup: BackupMetadata): Promise<void> {
    if (backup.location.startsWith('s3://')) {
      await execAsync(`aws s3 rm ${backup.location}`);
    } else {
      await execAsync(`rm -rf ${backup.location}`);
    }
  }

  // Get last successful backup
  private getLastSuccessfulBackup(): BackupMetadata | null {
    const successfulBackups = this.backupHistory
      .filter(b => b.status === 'success')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return successfulBackups[0] || null;
  }

  // Get feature flags for backup
  private async getFeatureFlags(): Promise<any> {
    // Implementation to get current feature flags
    return {};
  }

  // Get compliance settings for backup
  private async getComplianceSettings(): Promise<any> {
    // Implementation to get compliance configuration
    return {};
  }

  // Notify backup completion
  private async notifyBackupComplete(metadata: BackupMetadata): Promise<void> {
    const message = `Backup completed successfully: ${metadata.id} (${metadata.size} bytes in ${metadata.duration}ms)`;
    console.log(message);
    
    // Send notifications to configured channels
    for (const channel of this.config.notificationChannels) {
      await this.sendNotification(channel, message);
    }
  }

  // Notify backup failure
  private async notifyBackupFailed(metadata: BackupMetadata, error: Error): Promise<void> {
    const message = `Backup failed: ${metadata.id} - ${error.message}`;
    console.error(message);
    
    // Send notifications to configured channels
    for (const channel of this.config.notificationChannels) {
      await this.sendNotification(channel, message);
    }
  }

  // Send notification
  private async sendNotification(channel: string, message: string): Promise<void> {
    // Implementation for different notification channels
    switch (channel) {
      case 'email':
        // Send email notification
        break;
      case 'slack':
        // Send Slack notification
        break;
      case 'webhook':
        // Send webhook notification
        break;
    }
  }

  // Get backup status
  public getBackupStatus(): {
    lastBackup: BackupMetadata | null;
    totalBackups: number;
    totalSize: number;
    successRate: number;
  } {
    const lastBackup = this.getLastSuccessfulBackup();
    const totalBackups = this.backupHistory.length;
    const successfulBackups = this.backupHistory.filter(b => b.status === 'success').length;
    const totalSize = this.backupHistory
      .filter(b => b.status === 'success')
      .reduce((sum, b) => sum + b.size, 0);
    
    return {
      lastBackup,
      totalBackups,
      totalSize,
      successRate: totalBackups > 0 ? successfulBackups / totalBackups : 0,
    };
  }
}