import { EncryptionService } from './encryptionService';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class AuditService {
  private static auditLog: AuditLogEntry[] = [];

  // Log security-relevant events
  static log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      id: EncryptionService.generateSecureToken(),
      timestamp: new Date(),
      ...entry,
    };

    this.auditLog.push(auditEntry);
    
    // Store in database in production
    console.log('[AUDIT]', JSON.stringify(auditEntry));
    
    // Alert on high-risk events
    if (entry.riskLevel === 'HIGH' || entry.riskLevel === 'CRITICAL') {
      this.triggerSecurityAlert(auditEntry);
    }
  }

  // Log authentication events
  static logAuth(userId: string, action: 'LOGIN' | 'LOGOUT' | 'FAILED_LOGIN' | 'PASSWORD_RESET', 
                 success: boolean, ipAddress: string, userAgent: string, metadata?: any): void {
    this.log({
      userId,
      action,
      resource: 'authentication',
      ipAddress,
      userAgent,
      success,
      metadata,
      riskLevel: action === 'FAILED_LOGIN' ? 'MEDIUM' : 'LOW',
    });
  }

  // Log data access events
  static logDataAccess(userId: string, action: 'READ' | 'create' | 'update' | 'delete', 
                       resource: string, resourceId: string, ipAddress: string, 
                       userAgent: string, success: boolean = true): void {
    const riskLevel = action === 'delete' ? 'HIGH' : 
                     action === 'update' ? 'MEDIUM' : 'LOW';
    
    this.log({
      userId,
      action: `data_${action}`,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      success,
      riskLevel,
    });
  }

  // Log biometric events
  static logBiometric(userId: string, action: 'enroll' | 'authenticate' | 'verify', 
                      ipAddress: string, userAgent: string, success: boolean, 
                      confidence?: number): void {
    this.log({
      userId,
      action: `biometric_${action}`,
      resource: 'biometric_data',
      ipAddress,
      userAgent,
      success,
      metadata: { confidence },
      riskLevel: 'HIGH', // Biometric events are always high risk
    });
  }

  // Log physical security events
  static logPhysicalSecurity(userId: string, action: string, deviceId: string, 
                           success: boolean, ipAddress: string, userAgent: string, 
                           metadata?: any): void {
    this.log({
      userId,
      action: `physical_${action}`,
      resource: 'door_access',
      resourceId: deviceId,
      ipAddress,
      userAgent,
      success,
      metadata,
      riskLevel: 'HIGH',
    });
  }

  // Log compliance events
  static logCompliance(userId: string, action: string, dataType: string, 
                      success: boolean, ipAddress: string, userAgent: string, 
                      metadata?: any): void {
    this.log({
      userId,
      action: `compliance_${action}`,
      resource: 'compliance',
      resourceId: dataType,
      ipAddress,
      userAgent,
      success,
      metadata,
      riskLevel: 'HIGH',
    });
  }

  // Detect suspicious patterns
  static detectSuspiciousActivity(): AuditLogEntry[] {
    const recentLogs = this.auditLog.filter(
      entry => entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const suspicious: AuditLogEntry[] = [];

    // Multiple failed logins from same IP
    const failedLogins = recentLogs.filter(
      entry => entry.action === 'FAILED_LOGIN'
    );
    
    const ipCounts = failedLogins.reduce((acc, entry) => {
      acc[entry.ipAddress] = (acc[entry.ipAddress] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(ipCounts).forEach(([ip, count]) => {
      if (count >= 5) {
        suspicious.push(...failedLogins.filter(entry => entry.ipAddress === ip));
      }
    });

    // Unusual access patterns
    const accessOutsideHours = recentLogs.filter(entry => {
      const hour = entry.timestamp.getHours();
      return hour < 6 || hour > 22; // Outside 6 AM - 10 PM
    });

    suspicious.push(...accessOutsideHours);

    // High-risk actions by non-admin users
    const highRiskActions = recentLogs.filter(
      entry => entry.riskLevel === 'HIGH' || entry.riskLevel === 'CRITICAL'
    );

    suspicious.push(...highRiskActions);

    return suspicious;
  }

  // Generate security report
  static generateSecurityReport(startDate: Date, endDate: Date): {
    totalEvents: number;
    authenticationEvents: number;
    dataAccessEvents: number;
    biometricEvents: number;
    physicalSecurityEvents: number;
    suspiciousEvents: number;
    topRisks: string[];
  } {
    const logs = this.auditLog.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );

    return {
      totalEvents: logs.length,
      authenticationEvents: logs.filter(e => e.resource === 'authentication').length,
      dataAccessEvents: logs.filter(e => e.action.startsWith('data_')).length,
      biometricEvents: logs.filter(e => e.action.startsWith('biometric_')).length,
      physicalSecurityEvents: logs.filter(e => e.resource === 'door_access').length,
      suspiciousEvents: logs.filter(e => e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL').length,
      topRisks: this.getTopRisks(logs),
    };
  }

  private static getTopRisks(logs: AuditLogEntry[]): string[] {
    const riskCounts = logs.reduce((acc, entry) => {
      if (entry.riskLevel === 'HIGH' || entry.riskLevel === 'CRITICAL') {
        acc[entry.action] = (acc[entry.action] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(riskCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([action]) => action);
  }

  private static triggerSecurityAlert(entry: AuditLogEntry): void {
    console.warn('[SECURITY ALERT]', {
      timestamp: entry.timestamp,
      action: entry.action,
      resource: entry.resource,
      userId: entry.userId,
      riskLevel: entry.riskLevel,
      success: entry.success,
    });

    // In production, this would send alerts to security team
    // via email, SMS, Slack, etc.
  }

  // Get audit logs for compliance reporting
  static getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: string;
  }): AuditLogEntry[] {
    let logs = [...this.auditLog];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(entry => entry.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(entry => entry.action.includes(filters.action!));
      }
      if (filters.resource) {
        logs = logs.filter(entry => entry.resource === filters.resource);
      }
      if (filters.startDate) {
        logs = logs.filter(entry => entry.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(entry => entry.timestamp <= filters.endDate!);
      }
      if (filters.riskLevel) {
        logs = logs.filter(entry => entry.riskLevel === filters.riskLevel);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}