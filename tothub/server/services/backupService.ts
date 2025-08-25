import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { format } from 'date-fns';
import { db } from '../db';
import crypto from 'crypto';

export interface BackupConfig {
  type: 'full' | 'incremental' | 'differential';
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retention: number; // days to keep backups
  encryption: boolean;
  compression: boolean;
  destination: 'local' | 's3' | 'both';
}

export interface BackupResult {
  backupId: string;
  timestamp: Date;
  size: number;
  duration: number;
  status: 'success' | 'failed';
  error?: string;
  location: string;
}

export interface RestorePoint {
  backupId: string;
  timestamp: Date;
  type: string;
  size: number;
  verified: boolean;
  location: string;
}

export class BackupService {
  private static readonly BACKUP_DIR = '/var/backups/tothub';
  private static readonly ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';

  // Create database backup
  static async createBackup(config: BackupConfig): Promise<BackupResult> {
    const startTime = Date.now();
    const backupId = crypto.randomUUID();
    const timestamp = new Date();
    const filename = `tothub_${config.type}_${format(timestamp, 'yyyyMMdd_HHmmss')}.sql`;
    const backupPath = path.join(this.BACKUP_DIR, filename);

    try {
      // Ensure backup directory exists
      await fs.mkdir(this.BACKUP_DIR, { recursive: true });

      // Create PostgreSQL dump
      const dumpCommand = `pg_dump ${process.env.DATABASE_URL} > ${backupPath}`;
      execSync(dumpCommand);

      let finalPath = backupPath;
      let size = (await fs.stat(backupPath)).size;

      // Compress if requested
      if (config.compression) {
        const compressedPath = `${backupPath}.gz`;
        execSync(`gzip -c ${backupPath} > ${compressedPath}`);
        await fs.unlink(backupPath);
        finalPath = compressedPath;
        size = (await fs.stat(compressedPath)).size;
      }

      // Encrypt if requested
      if (config.encryption) {
        const encryptedPath = `${finalPath}.enc`;
        await this.encryptFile(finalPath, encryptedPath);
        await fs.unlink(finalPath);
        finalPath = encryptedPath;
        size = (await fs.stat(encryptedPath)).size;
      }

      // Upload to S3 if configured
      if (config.destination === 's3' || config.destination === 'both') {
        await this.uploadToS3(finalPath, filename);
      }

      // Clean up local file if S3-only
      if (config.destination === 's3') {
        await fs.unlink(finalPath);
      }

      const duration = Date.now() - startTime;

      // Log successful backup
      await this.logBackup({
        backupId,
        timestamp,
        type: config.type,
        size,
        duration,
        status: 'success',
        location: config.destination,
      });

      return {
        backupId,
        timestamp,
        size,
        duration,
        status: 'success',
        location: finalPath,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed backup
      await this.logBackup({
        backupId,
        timestamp,
        type: config.type,
        size: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        error: errorMessage,
        location: '',
      });

      return {
        backupId,
        timestamp,
        size: 0,
        duration: Date.now() - startTime,
        status: 'failed',
        error: errorMessage,
        location: '',
      };
    }
  }

  // Restore from backup
  static async restoreBackup(backupId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const backup = await this.getBackupInfo(backupId);
      if (!backup) {
        return { success: false, error: 'Backup not found' };
      }

      let restorePath = backup.location;

      // Decrypt if encrypted
      if (restorePath.endsWith('.enc')) {
        const decryptedPath = restorePath.replace('.enc', '');
        await this.decryptFile(restorePath, decryptedPath);
        restorePath = decryptedPath;
      }

      // Decompress if compressed
      if (restorePath.endsWith('.gz')) {
        execSync(`gunzip -c ${restorePath} > ${restorePath.replace('.gz', '')}`);
        restorePath = restorePath.replace('.gz', '');
      }

      // Restore database
      execSync(`psql ${process.env.DATABASE_URL} < ${restorePath}`);

      // Clean up temporary files
      if (restorePath !== backup.location) {
        await fs.unlink(restorePath);
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Automated backup scheduling
  static async scheduleBackups(config: BackupConfig): Promise<void> {
    // In production, this would use cron or a job scheduler
    // For now, we'll create a simple interval-based scheduler
    
    const intervals = {
      hourly: 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };

    setInterval(async () => {
      await this.createBackup(config);
      await this.cleanupOldBackups(config.retention);
    }, intervals[config.schedule]);
  }

  // Clean up old backups based on retention policy
  static async cleanupOldBackups(retentionDays: number): Promise<{
    deleted: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = await fs.readdir(this.BACKUP_DIR);
      let deleted = 0;

      for (const file of files) {
        const filePath = path.join(this.BACKUP_DIR, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deleted++;
        }
      }

      return { deleted };
    } catch (error) {
      console.error('Cleanup failed:', error);
      return { deleted: 0 };
    }
  }

  // Verify backup integrity
  static async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackupInfo(backupId);
      if (!backup) return false;

      // Check file exists
      await fs.access(backup.location);

      // For encrypted files, verify decryption works
      if (backup.location.endsWith('.enc')) {
        const testPath = `/tmp/test_${backupId}`;
        await this.decryptFile(backup.location, testPath);
        await fs.unlink(testPath);
      }

      // Update verification status
      await this.updateBackupStatus(backupId, { verified: true });

      return true;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }

  // Get list of available restore points
  static async getRestorePoints(): Promise<RestorePoint[]> {
    try {
      const files = await fs.readdir(this.BACKUP_DIR);
      const restorePoints: RestorePoint[] = [];

      for (const file of files) {
        const filePath = path.join(this.BACKUP_DIR, file);
        const stats = await fs.stat(filePath);
        
        // Parse backup info from filename
        const match = file.match(/tothub_(\w+)_(\d{8}_\d{6})/);
        if (match) {
          restorePoints.push({
            backupId: crypto.randomUUID(), // Generate ID based on file
            timestamp: stats.mtime,
            type: match[1],
            size: stats.size,
            verified: false,
            location: filePath,
          });
        }
      }

      return restorePoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } catch (error) {
      console.error('Failed to get restore points:', error);
      return [];
    }
  }

  // Disaster recovery test
  static async testDisasterRecovery(): Promise<{
    success: boolean;
    results: any;
  }> {
    const testResults = {
      backupCreation: false,
      backupVerification: false,
      restoreTest: false,
      dataIntegrity: false,
      performanceMetrics: {},
    };

    try {
      // Test 1: Create backup
      const backup = await this.createBackup({
        type: 'full',
        schedule: 'daily',
        retention: 7,
        encryption: true,
        compression: true,
        destination: 'local',
      });
      testResults.backupCreation = backup.status === 'success';

      // Test 2: Verify backup
      if (backup.status === 'success') {
        testResults.backupVerification = await this.verifyBackup(backup.backupId);
      }

      // Test 3: Restore to test database
      // In production, this would restore to a separate test instance
      
      // Test 4: Verify data integrity
      // Would compare row counts, checksums, etc.

      return {
        success: Object.values(testResults).every(result => 
          typeof result === 'boolean' ? result : true
        ),
        results: testResults,
      };
    } catch (error) {
      return {
        success: false,
        results: {
          ...testResults,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  // Encrypt file
  private static async encryptFile(inputPath: string, outputPath: string): Promise<void> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const input = await fs.readFile(inputPath);
    
    const encrypted = Buffer.concat([
      iv,
      cipher.update(input),
      cipher.final(),
      cipher.getAuthTag(),
    ]);
    
    await fs.writeFile(outputPath, encrypted);
  }

  // Decrypt file
  private static async decryptFile(inputPath: string, outputPath: string): Promise<void> {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32);
    
    const encrypted = await fs.readFile(inputPath);
    const iv = encrypted.slice(0, 16);
    const authTag = encrypted.slice(-16);
    const data = encrypted.slice(16, -16);
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);
    
    await fs.writeFile(outputPath, decrypted);
  }

  // Upload to S3 (mock implementation)
  private static async uploadToS3(filePath: string, filename: string): Promise<void> {
    // In production, use AWS SDK
    console.log(`Uploading ${filename} to S3...`);
    // Mock successful upload
  }

  // Log backup operation
  private static async logBackup(info: any): Promise<void> {
    // In production, store in database
    console.log('Backup logged:', info);
  }

  // Get backup info
  private static async getBackupInfo(backupId: string): Promise<any> {
    // In production, retrieve from database
    return null;
  }

  // Update backup status
  private static async updateBackupStatus(backupId: string, status: any): Promise<void> {
    // In production, update database
    console.log(`Backup ${backupId} status updated:`, status);
  }
}