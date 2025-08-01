import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

// Performance monitoring interface
export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  userId?: string;
}

// System health metrics
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  databaseConnections: number;
  responseTime: number;
  errorRate: number;
  timestamp: Date;
}

// Alert configuration
export interface AlertConfig {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  duration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[]; // email, slack, sms
}

export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: PerformanceMetrics[] = [];
  private systemMetrics: SystemMetrics[] = [];
  private alerts: AlertConfig[] = [];
  private errorCounts: Map<string, number> = new Map();
  private endpointMetrics: Map<string, { count: number; totalTime: number; slowCount: number }> = new Map();
  private totalRequests: number = 0;
  private totalResponseTime: number = 0;
  private slowQueries: Array<{ query: string; duration: number; timestamp: Date }> = [];

  constructor() {
    this.initializeSentry();
    this.setupDefaultAlerts();
    this.startSystemMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize Sentry for error tracking
  private initializeSentry(): void {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend(event: any) {
          // Filter out sensitive data
          if (event.request?.data) {
            delete event.request.data.password;
            delete event.request.data.token;
            delete event.request.data.biometricData;
          }
          return event;
        },
      });
    }
  }

  // Setup default alert configurations
  private setupDefaultAlerts(): void {
    this.alerts = [
      {
        metric: 'responseTime',
        threshold: 5000, // 5 seconds
        operator: 'gt',
        duration: 5,
        severity: 'high',
        channels: ['email', 'slack'],
      },
      {
        metric: 'errorRate',
        threshold: 0.05, // 5%
        operator: 'gt',
        duration: 10,
        severity: 'critical',
        channels: ['email', 'slack', 'sms'],
      },
      {
        metric: 'memoryUsage',
        threshold: 0.85, // 85%
        operator: 'gt',
        duration: 15,
        severity: 'medium',
        channels: ['email'],
      },
      {
        metric: 'diskUsage',
        threshold: 0.90, // 90%
        operator: 'gt',
        duration: 30,
        severity: 'high',
        channels: ['email', 'slack'],
      },
      {
        metric: 'databaseConnections',
        threshold: 80, // 80% of pool
        operator: 'gt',
        duration: 5,
        severity: 'high',
        channels: ['email', 'slack'],
      },
    ];
  }

  // Start continuous system monitoring
  private startSystemMonitoring(): void {
    setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlerts();
      this.cleanupOldMetrics();
    }, 60000); // Every minute
  }

  // Express middleware for performance monitoring
  public performanceMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      // Override end method to capture metrics
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any): any {
        const duration = Date.now() - startTime;
        
        const metric: PerformanceMetrics = {
          endpoint: req.path,
          method: req.method,
          duration,
          statusCode: res.statusCode,
          timestamp: new Date(),
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          userId: req.session?.userId,
        };

        MonitoringService.getInstance().recordMetric(metric);
        return originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Record performance metric
  public recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Track error rates
    if (metric.statusCode >= 400) {
      const errorKey = `${metric.method}_${metric.endpoint}`;
      this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    }

    // Log slow requests
    if (metric.duration > 1000) {
      console.warn(`Slow request detected: ${metric.method} ${metric.endpoint} - ${metric.duration}ms`);
    }

    // Update endpoint metrics
    const endpointKey = `${metric.method} ${metric.endpoint}`;
    const endpointStats = this.endpointMetrics.get(endpointKey) || { count: 0, totalTime: 0, slowCount: 0 };
    endpointStats.count++;
    endpointStats.totalTime += metric.duration;
    if (metric.duration > 1000) endpointStats.slowCount++;
    this.endpointMetrics.set(endpointKey, endpointStats);

    // Update totals
    this.totalRequests++;
    this.totalResponseTime += metric.duration;

    // Send to external monitoring (Sentry, New Relic, etc.)
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalMonitoring(metric);
    }
  }

  // Collect system metrics
  private async collectSystemMetrics(): Promise<void> {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const metric: SystemMetrics = {
        cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to milliseconds
        memoryUsage: memUsage.heapUsed / memUsage.heapTotal,
        diskUsage: await this.getDiskUsage(),
        activeConnections: await this.getActiveConnections(),
        databaseConnections: await this.getDatabaseConnections(),
        responseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate(),
        timestamp: new Date(),
      };

      this.systemMetrics.push(metric);
    } catch (error) {
      console.error('Error collecting system metrics:', error);
      Sentry.captureException(error);
    }
  }

  // Get disk usage percentage
  private async getDiskUsage(): Promise<number> {
    try {
      const { execSync } = require('child_process');
      const output = execSync("df / | tail -1 | awk '{print $5}' | sed 's/%//'").toString();
      return parseFloat(output) / 100;
    } catch {
      return 0;
    }
  }

  // Get active connections count
  private async getActiveConnections(): Promise<number> {
    try {
      const { execSync } = require('child_process');
      const output = execSync("netstat -an | grep :3000 | wc -l").toString();
      return parseInt(output.trim()) || 0;
    } catch {
      return 0;
    }
  }

  // Get database connections count
  private async getDatabaseConnections(): Promise<number> {
    // This would integrate with your database pool
    // For now, return a mock value
    return Math.floor(Math.random() * 20);
  }

  // Calculate average response time
  private getAverageResponseTime(): number {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const totalTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / recentMetrics.length;
  }

  // Calculate error rate
  private getErrorRate(): number {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 300000 // Last 5 minutes
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    return errorCount / recentMetrics.length;
  }

  // Check alerts against current metrics
  private checkAlerts(): void {
    const latestMetric = this.systemMetrics[this.systemMetrics.length - 1];
    if (!latestMetric) return;

    this.alerts.forEach(alert => {
      const currentValue = this.getMetricValue(latestMetric, alert.metric);
      const shouldAlert = this.evaluateAlert(currentValue, alert);
      
      if (shouldAlert) {
        this.triggerAlert(alert, currentValue);
      }
    });
  }

  // Get metric value by name
  private getMetricValue(metric: SystemMetrics, name: string): number {
    switch (name) {
      case 'cpuUsage': return metric.cpuUsage;
      case 'memoryUsage': return metric.memoryUsage;
      case 'diskUsage': return metric.diskUsage;
      case 'activeConnections': return metric.activeConnections;
      case 'databaseConnections': return metric.databaseConnections;
      case 'responseTime': return metric.responseTime;
      case 'errorRate': return metric.errorRate;
      default: return 0;
    }
  }

  // Evaluate if alert should trigger
  private evaluateAlert(value: number, alert: AlertConfig): boolean {
    switch (alert.operator) {
      case 'gt': return value > alert.threshold;
      case 'lt': return value < alert.threshold;
      case 'eq': return value === alert.threshold;
      default: return false;
    }
  }

  // Trigger alert notification
  private async triggerAlert(alert: AlertConfig, value: number): Promise<void> {
    const message = `Alert: ${alert.metric} is ${value} (threshold: ${alert.threshold})`;
    
    console.error(`🚨 ${alert.severity.toUpperCase()} ALERT: ${message}`);
    
    // Send to Sentry
    Sentry.captureMessage(message, alert.severity as any);
    
    // Send to external alerting systems
    if (process.env.NODE_ENV === 'production') {
      await this.sendAlert(alert, message);
    }
  }

  // Send alert to external systems
  private async sendAlert(alert: AlertConfig, message: string): Promise<void> {
    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailAlert(message);
            break;
          case 'slack':
            await this.sendSlackAlert(message);
            break;
          case 'sms':
            await this.sendSMSAlert(message);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} alert:`, error);
      }
    }
  }

  // Send email alert (implement with your email service)
  private async sendEmailAlert(message: string): Promise<void> {
    // Implement email alerting
    console.log(`EMAIL ALERT: ${message}`);
  }

  // Send Slack alert (implement with Slack webhook)
  private async sendSlackAlert(message: string): Promise<void> {
    // Implement Slack alerting
    console.log(`SLACK ALERT: ${message}`);
  }

  // Send SMS alert (implement with Twilio or similar)
  private async sendSMSAlert(message: string): Promise<void> {
    // Implement SMS alerting
    console.log(`SMS ALERT: ${message}`);
  }

  // Send metrics to external monitoring
  private sendToExternalMonitoring(metric: PerformanceMetrics): void {
    // Send to New Relic, DataDog, etc.
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      // Implementation for New Relic
    }
    
    if (process.env.DATADOG_API_KEY) {
      // Implementation for DataDog
    }
  }

  // Clean up old metrics to prevent memory leaks
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    this.systemMetrics = this.systemMetrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  // Get current metrics for dashboard
  public getCurrentMetrics(): {
    performance: PerformanceMetrics[];
    system: SystemMetrics[];
    alerts: AlertConfig[];
  } {
    return {
      performance: this.metrics.slice(-100), // Last 100 requests
      system: this.systemMetrics.slice(-60), // Last hour
      alerts: this.alerts,
    };
  }

  // Health check endpoint data
  public getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    metrics: SystemMetrics | null;
  } {
    const uptime = process.uptime();
    const latestMetric = this.systemMetrics[this.systemMetrics.length - 1];
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (latestMetric) {
      if (latestMetric.errorRate > 0.1 || latestMetric.responseTime > 10000) {
        status = 'critical';
      } else if (latestMetric.errorRate > 0.05 || latestMetric.responseTime > 5000) {
        status = 'warning';
      }
    }
    
    return {
      status,
      uptime,
      metrics: latestMetric || null,
    };
  }

  // Get performance metrics for the performance monitor
  public getMetrics() {
    const errorCount = Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0);
    const errorRate = this.totalRequests > 0 ? (errorCount / this.totalRequests) * 100 : 0;
    const avgResponseTime = this.totalRequests > 0 ? this.totalResponseTime / this.totalRequests : 0;
    
    // Get top endpoints by response time
    const endpointMetrics = Array.from(this.endpointMetrics.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgResponseTime: stats.totalTime / stats.count,
        slowCount: stats.slowCount
      }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime);

    return {
      totalRequests: this.totalRequests,
      averageResponseTime: avgResponseTime,
      slowRequests: endpointMetrics.reduce((sum, e) => sum + e.slowCount, 0),
      errorRate,
      endpointMetrics
    };
  }

  // Get detailed endpoint metrics
  public getEndpointMetrics() {
    return Array.from(this.endpointMetrics.entries()).map(([endpoint, stats]) => ({
      endpoint,
      count: stats.count,
      avgResponseTime: stats.totalTime / stats.count,
      slowCount: stats.slowCount,
      slowRate: (stats.slowCount / stats.count) * 100
    }));
  }

  // Get slow queries
  public getSlowQueries() {
    return this.slowQueries.slice(-50); // Return last 50 slow queries
  }

  // Record a slow query
  public recordSlowQuery(query: string, duration: number) {
    this.slowQueries.push({
      query,
      duration,
      timestamp: new Date()
    });
    
    // Keep only recent queries
    if (this.slowQueries.length > 100) {
      this.slowQueries = this.slowQueries.slice(-100);
    }
  }
}