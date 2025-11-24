import { EventEmitter } from 'events';
import { storage } from '../storage';
import { alerts } from '@shared/schema';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertChannel = 'email' | 'sms' | 'in-app' | 'webhook';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  autoRemediate: boolean;
  remediationAction?: string;
  cooldownMinutes: number;
  enabled: boolean;
}

interface AlertNotification {
  alertId: string;
  channel: AlertChannel;
  sentAt: Date;
  status: 'sent' | 'failed';
  error?: string;
}

export class EnhancedAlertService extends EventEmitter {
  private static instance: EnhancedAlertService;
  private alertRules: Map<string, AlertRule> = new Map();
  private lastAlertTime: Map<string, Date> = new Map();
  private alertHistory: AlertNotification[] = [];

  private constructor() {
    super();
    this.initializeDefaultRules();
    this.startMonitoring();
  }

  public static getInstance(): EnhancedAlertService {
    if (!EnhancedAlertService.instance) {
      EnhancedAlertService.instance = new EnhancedAlertService();
    }
    return EnhancedAlertService.instance;
  }

  // Initialize default alert rules
  private initializeDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        condition: 'memory > 85',
        severity: 'critical',
        channels: ['in-app', 'email'],
        autoRemediate: true,
        remediationAction: 'restart-service',
        cooldownMinutes: 15,
        enabled: true,
      },
      {
        id: 'ratio-violation',
        name: 'Staff-Child Ratio Violation',
        condition: 'ratio-violation',
        severity: 'critical',
        channels: ['in-app', 'sms', 'email'],
        autoRemediate: false,
        cooldownMinutes: 5,
        enabled: true,
      },
      {
        id: 'low-staff',
        name: 'Low Staff Coverage',
        condition: 'staff-coverage < 80',
        severity: 'warning',
        channels: ['in-app', 'email'],
        autoRemediate: false,
        cooldownMinutes: 30,
        enabled: true,
      },
      {
        id: 'child-not-picked-up',
        name: 'Child Not Picked Up',
        condition: 'child-not-picked-up',
        severity: 'warning',
        channels: ['in-app', 'sms'],
        autoRemediate: false,
        cooldownMinutes: 10,
        enabled: true,
      },
      {
        id: 'database-slow',
        name: 'Database Performance',
        condition: 'db-response-time > 1000',
        severity: 'warning',
        channels: ['in-app'],
        autoRemediate: true,
        remediationAction: 'clear-cache',
        cooldownMinutes: 20,
        enabled: true,
      },
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  // Start monitoring for alert conditions
  private startMonitoring(): void {
    // Disable background monitoring in development to avoid noisy restarts
    if (process.env.NODE_ENV === 'production') {
      setInterval(() => {
        this.checkAllRules();
      }, 60 * 1000);
      setInterval(() => {
        this.checkCriticalRules();
      }, 10 * 1000);
    }
  }

  // Check all alert rules
  private async checkAllRules(): Promise<void> {
    for (const [id, rule] of this.alertRules) {
      if (rule.enabled) {
        await this.evaluateRule(rule);
      }
    }
  }

  // Check only critical rules
  private async checkCriticalRules(): Promise<void> {
    for (const [id, rule] of this.alertRules) {
      if (rule.enabled && rule.severity === 'critical') {
        await this.evaluateRule(rule);
      }
    }
  }

  // Evaluate a single rule
  private async evaluateRule(rule: AlertRule): Promise<void> {
    try {
      // Check cooldown
      const lastAlert = this.lastAlertTime.get(rule.id);
      if (lastAlert) {
        const minutesSinceLastAlert = (Date.now() - lastAlert.getTime()) / (1000 * 60);
        if (minutesSinceLastAlert < rule.cooldownMinutes) {
          return;
        }
      }

      // Evaluate condition
      const shouldAlert = await this.evaluateCondition(rule.condition);
      
      if (shouldAlert) {
        await this.triggerAlert(rule);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }

  // Evaluate a condition string
  private async evaluateCondition(condition: string): Promise<boolean> {
    switch (condition) {
      case 'memory > 85':
        const memUsage = process.memoryUsage();
        const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        return memPercent > 85;

      case 'ratio-violation':
        // Check current staff-child ratios
        const ratios = await this.checkStaffChildRatios();
        return ratios.some(r => r.violated);

      case 'staff-coverage < 80':
        const coverage = await this.getStaffCoverage();
        return coverage < 80;

      case 'child-not-picked-up':
        return await this.checkChildrenNotPickedUp();

      case 'db-response-time > 1000':
        // This would be tracked by monitoring service
        return false; // Placeholder

      default:
        // Custom condition evaluation
        return false;
    }
  }

  // Trigger an alert
  private async triggerAlert(rule: AlertRule): Promise<void> {
    console.log(`🚨 Alert triggered: ${rule.name} (${rule.severity})`);

    // Create alert in database
    const alert = await storage.createAlert({
      type: rule.name,
      message: `Alert: ${rule.name}`,
      severity: rule.severity,
      metadata: {
        ruleId: rule.id,
        condition: rule.condition,
      },
    });

    // Update last alert time
    this.lastAlertTime.set(rule.id, new Date());

    // Send notifications
    await this.sendNotifications(alert, rule);

    // Auto-remediate if configured
    if (rule.autoRemediate && rule.remediationAction) {
      await this.performRemediation(rule.remediationAction);
    }

    // Emit event
    this.emit('alert:triggered', { alert, rule });
  }

  // Send notifications through configured channels
  private async sendNotifications(alert: any, rule: AlertRule): Promise<void> {
    for (const channel of rule.channels) {
      try {
        await this.sendNotification(alert, channel);
        
        this.alertHistory.push({
          alertId: alert.id,
          channel,
          sentAt: new Date(),
          status: 'sent',
        });
      } catch (error: any) {
        console.error(`Failed to send ${channel} notification:`, error);
        
        this.alertHistory.push({
          alertId: alert.id,
          channel,
          sentAt: new Date(),
          status: 'failed',
          error: error.message,
        });
      }
    }
  }

  // Send notification through specific channel
  private async sendNotification(alert: any, channel: AlertChannel): Promise<void> {
    switch (channel) {
      case 'in-app':
        // Alert is already created in database, will show in UI
        break;

      case 'email':
        // TODO: Integrate with email service
        console.log(`📧 Sending email alert: ${alert.message}`);
        break;

      case 'sms':
        // TODO: Integrate with SMS service (Twilio)
        console.log(`📱 Sending SMS alert: ${alert.message}`);
        break;

      case 'webhook':
        // TODO: Send to configured webhooks
        console.log(`🔗 Sending webhook alert: ${alert.message}`);
        break;
    }
  }

  // Perform automatic remediation
  private async performRemediation(action: string): Promise<void> {
    console.log(`🔧 Performing auto-remediation: ${action}`);

    switch (action) {
      case 'restart-service':
        if (process.env.NODE_ENV === 'production') {
          // Trigger service restart
          console.log('Scheduling service restart...');
          setTimeout(() => {
            process.exit(0); // Process manager will restart it
          }, 5000);
        } else {
          console.log('Restart suppressed in development');
        }
        break;

      case 'clear-cache':
        // Clear all caches
        const { memoryCache } = await import('./simpleMemoryCache');
        memoryCache.clearAllCaches();
        console.log('Caches cleared');
        break;

      case 'scale-up':
        // TODO: Trigger auto-scaling
        console.log('Triggering auto-scale...');
        break;

      default:
        console.log(`Unknown remediation action: ${action}`);
    }
  }

  // Helper methods for condition evaluation
  private async checkStaffChildRatios(): Promise<Array<{ room: string; ratio: number; required: number; violated: boolean }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attendance = await storage.getAttendanceByDate(today);
      const staffResult = await storage.getAllStaff();
      const staff = staffResult.data || [];
      
      // Simplified ratio check
      const totalChildren = attendance.filter(a => a.checkInTime && !a.checkOutTime).length;
      const totalStaff = staff.filter(s => s.isActive).length;
      const currentRatio = totalStaff > 0 ? totalChildren / totalStaff : 0;
      
      return [{
        room: 'All',
        ratio: currentRatio,
        required: 10, // Example required ratio
        violated: currentRatio > 10,
      }];
    } catch (error) {
      console.error('Error checking staff-child ratios:', error);
      return [];
    }
  }

  private async getStaffCoverage(): Promise<number> {
    try {
      const staffResult = await storage.getAllStaff();
      const activeStaff = (staffResult.data || []).filter(s => s.isActive).length;
      const requiredStaff = 10; // Example
      return (activeStaff / requiredStaff) * 100;
    } catch (error) {
      console.error('Error getting staff coverage:', error);
      return 100; // Default to full coverage
    }
  }

  private async checkChildrenNotPickedUp(): Promise<boolean> {
    try {
      const now = new Date();
      const closingTime = new Date();
      closingTime.setHours(18, 0, 0, 0); // 6 PM

      if (now > closingTime) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await storage.getAttendanceByDate(today);
        const notPickedUp = attendance.filter(a => a.checkInTime && !a.checkOutTime);
        return notPickedUp.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error checking children not picked up:', error);
      return false;
    }
  }

  // Public methods for managing rules
  public addRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  public updateRule(id: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.get(id);
    if (rule) {
      this.alertRules.set(id, { ...rule, ...updates });
    }
  }

  public deleteRule(id: string): void {
    this.alertRules.delete(id);
  }

  public getRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  public getAlertHistory(hours: number = 24): AlertNotification[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.alertHistory.filter(n => n.sentAt > cutoff);
  }

  // Manual alert trigger
  public async manualAlert(
    message: string, 
    severity: AlertSeverity = 'info',
    channels: AlertChannel[] = ['in-app']
  ): Promise<void> {
    const alert = await storage.createAlert({
      type: 'Manual Alert',
      message,
      severity,
      metadata: { manual: true },
    });

    const rule: AlertRule = {
      id: 'manual',
      name: 'Manual Alert',
      condition: 'manual',
      severity,
      channels,
      autoRemediate: false,
      cooldownMinutes: 0,
      enabled: true,
    };

    await this.sendNotifications(alert, rule);
  }
}

export const enhancedAlertService = EnhancedAlertService.getInstance();