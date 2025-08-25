import { db } from '../db';
import { auditLogs, securityLogs, users } from '@shared/schema';
import { sql, eq, and, gte, lte, desc, or, like, ne } from 'drizzle-orm';
import { format } from 'date-fns';

export interface AuditEvent {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceReport {
  period: string;
  totalEvents: number;
  userActivity: Record<string, number>;
  criticalActions: any[];
  dataAccess: any[];
  policyViolations: any[];
}

export interface DataExport {
  userId: string;
  dataTypes: string[];
  format: 'json' | 'csv' | 'pdf';
  purpose: string;
  includeChildren?: boolean;
}

export class AuditTrailService {
  // Log all actions with detailed metadata
  static async logAction(event: AuditEvent): Promise<void> {
    await db.insert(auditLogs).values({
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      changes: event.changes ? JSON.stringify(event.changes) : null,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date(),
    });

    // Log critical actions to security logs as well
    if (this.isCriticalAction(event.action)) {
      await db.insert(securityLogs).values({
        userId: event.userId,
        action: event.action,
        resource: `${event.entityType}:${event.entityId}`,
        result: 'success',
        metadata: event.metadata,
        timestamp: new Date(),
      });
    }
  }

  // Determine if action is critical
  private static isCriticalAction(action: string): boolean {
    const criticalActions = [
      'delete',
      'export',
      'bulk_update',
      'permission_change',
      'data_access',
      'settings_change',
      'compliance_update',
      'financial_transaction'
    ];
    
    return criticalActions.some(critical => action.toLowerCase().includes(critical));
  }

  // Generate compliance report
  static async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    // Get all audit events in period
    const events = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          gte(auditLogs.timestamp, startDate.toISOString()),
          lte(auditLogs.timestamp, endDate.toISOString())
        )
      );

    // Analyze user activity
    const userActivity: Record<string, number> = {};
    events.forEach((event: any) => {
      userActivity[event.userId] = (userActivity[event.userId] || 0) + 1;
    });

    // Find critical actions
    const criticalActions = events.filter((event: any) => 
      this.isCriticalAction(event.action)
    );

    // Find data access events
    const dataAccess = events.filter((event: any) => 
      event.action.includes('view') || 
      event.action.includes('export') ||
      event.action.includes('access')
    );

    // Find potential policy violations
    const violations = await this.detectPolicyViolations(events);

    return {
      period: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
      totalEvents: events.length,
      userActivity,
      criticalActions: criticalActions.map((e: any) => ({
        user: e.userId,
        action: e.action,
        target: `${e.entityType}:${e.entityId}`,
        timestamp: e.timestamp,
      })),
      dataAccess: dataAccess.slice(0, 100), // Limit to 100 most recent
      policyViolations: violations,
    };
  }

  // Detect policy violations
  private static async detectPolicyViolations(events: any[]): Promise<any[]> {
    const violations: any[] = [];

    // Check for after-hours access
    events.forEach(event => {
      const hour = event.timestamp.getHours();
      if (hour < 6 || hour > 20) {
        violations.push({
          type: 'after_hours_access',
          user: event.userId,
          action: event.action,
          timestamp: event.timestamp,
        });
      }
    });

    // Check for bulk operations
    const userBulkOps = new Map<string, number>();
    events.forEach(event => {
      if (event.action.includes('bulk')) {
        const count = userBulkOps.get(event.userId) || 0;
        userBulkOps.set(event.userId, count + 1);
        
        if (count > 5) {
          violations.push({
            type: 'excessive_bulk_operations',
            user: event.userId,
            count: count + 1,
            timestamp: event.timestamp,
          });
        }
      }
    });

    // Check for rapid sequential actions (potential automation)
    const userActionTimes = new Map<string, Date[]>();
    events.forEach(event => {
      const times = userActionTimes.get(event.userId) || [];
      times.push(event.timestamp);
      userActionTimes.set(event.userId, times);
    });

    userActionTimes.forEach((times, userId) => {
      times.sort((a, b) => a.getTime() - b.getTime());
      let rapidActions = 0;
      
      for (let i = 1; i < times.length; i++) {
        if (times[i].getTime() - times[i-1].getTime() < 1000) { // Less than 1 second
          rapidActions++;
        }
      }
      
      if (rapidActions > 10) {
        violations.push({
          type: 'suspicious_automation',
          user: userId,
          rapidActionCount: rapidActions,
        });
      }
    });

    return violations;
  }

  // Data export tracking (GDPR compliance)
  static async logDataExport(exportRequest: DataExport): Promise<string> {
    const exportId = crypto.randomUUID();
    
    await this.logAction({
      userId: exportRequest.userId,
      action: 'data_export',
      entityType: 'user_data',
      entityId: exportRequest.userId,
      metadata: {
        exportId,
        dataTypes: exportRequest.dataTypes,
        format: exportRequest.format,
        purpose: exportRequest.purpose,
        includeChildren: exportRequest.includeChildren,
      },
    });

    return exportId;
  }

  // Get user's complete data for GDPR export
  static async exportUserData(userId: string): Promise<any> {
    // Get user information
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get all audit logs for user
    const userAuditLogs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp));

    // Get security logs
    const userSecurityLogs = await db
      .select()
      .from(securityLogs)
      .where(eq(securityLogs.userId, userId))
      .orderBy(desc(securityLogs.timestamp));

    return {
      userData: user,
      activityLogs: userAuditLogs,
      securityLogs: userSecurityLogs,
      exportDate: new Date(),
      exportId: crypto.randomUUID(),
    };
  }

  // Data retention policy enforcement
  static async enforceDataRetention(retentionDays: number): Promise<{
    auditLogsDeleted: number;
    securityLogsDeleted: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Delete old audit logs (except critical ones)
    const auditResult = await db
      .delete(auditLogs)
      .where(
        and(
          lte(auditLogs.timestamp, cutoffDate.toISOString()),
          sql`${auditLogs.action} NOT LIKE '%delete%'`,
          sql`${auditLogs.action} NOT LIKE '%financial%'`
        )
      );

    // Delete old security logs (except violations)
    const securityResult = await db
      .delete(securityLogs)
      .where(
        and(
          lte(securityLogs.timestamp, cutoffDate.toISOString()),
          ne(securityLogs.result, 'failure')
        )
      );

    return {
      auditLogsDeleted: auditResult.rowCount || 0,
      securityLogsDeleted: securityResult.rowCount || 0,
    };
  }

  // Search audit logs
  static async searchAuditLogs(
    query: string,
    filters?: {
      userId?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
      action?: string;
    }
  ): Promise<any[]> {
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(auditLogs.action, `%${query}%`),
          like(auditLogs.entityType, `%${query}%`),
          like(auditLogs.entityId, `%${query}%`)
        )
      );
    }

    if (filters?.userId) {
      conditions.push(eq(auditLogs.userId, filters.userId));
    }

    if (filters?.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }

    if (filters?.action) {
      conditions.push(like(auditLogs.action, `%${filters.action}%`));
    }

    if (filters?.startDate) {
      conditions.push(gte(auditLogs.timestamp, filters.startDate.toISOString()));
    }

    if (filters?.endDate) {
      conditions.push(lte(auditLogs.timestamp, filters.endDate.toISOString()));
    }

    return await db
      .select()
      .from(auditLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLogs.timestamp))
      .limit(1000);
  }

  // Generate audit certificate for compliance
  static async generateAuditCertificate(
    startDate: Date,
    endDate: Date
  ): Promise<{
    certificateId: string;
    period: string;
    summary: any;
    signature: string;
  }> {
    const report = await this.generateComplianceReport(startDate, endDate);
    const certificateId = crypto.randomUUID();
    
    const summary = {
      totalEvents: report.totalEvents,
      uniqueUsers: Object.keys(report.userActivity).length,
      criticalActions: report.criticalActions.length,
      violations: report.policyViolations.length,
      dataExports: report.dataAccess.filter(a => a.action === 'data_export').length,
    };

    // Generate digital signature (mock)
    const signature = Buffer.from(
      JSON.stringify({ certificateId, summary, timestamp: new Date() })
    ).toString('base64');

    await this.logAction({
      userId: 'system',
      action: 'generate_audit_certificate',
      entityType: 'compliance',
      entityId: certificateId,
      metadata: {
        period: report.period,
        summary,
      },
    });

    return {
      certificateId,
      period: report.period,
      summary,
      signature,
    };
  }
}