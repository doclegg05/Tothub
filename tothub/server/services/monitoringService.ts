import { memoryCache } from './simpleMemoryCache';
import { EventEmitter } from 'events';

interface MemoryMetrics {
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  arrayBuffers: number;
  cacheStats: any;
  uptime: number;
}

interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  endpoint: string;
  method: string;
  statusCode: number;
}

class MonitoringService extends EventEmitter {
  private memoryMetrics: MemoryMetrics[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private maxMetricsHistory = 100; // Keep last 100 measurements
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor() {
    super();
    this.startMonitoring();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📊 Memory monitoring service started');

    // Monitor memory every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.recordMemoryMetrics();
    }, 30000);

    // Initial measurement
    setTimeout(() => this.recordMemoryMetrics(), 5000);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('📊 Memory monitoring service stopped');
  }

  private recordMemoryMetrics(): void {
    const memUsage = process.memoryUsage();
    const metrics: MemoryMetrics = {
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      cacheStats: memoryCache.getCacheStats(),
      uptime: process.uptime()
    };

    this.memoryMetrics.push(metrics);
    
    // Keep only recent metrics
    if (this.memoryMetrics.length > this.maxMetricsHistory) {
      this.memoryMetrics = this.memoryMetrics.slice(-this.maxMetricsHistory);
    }

    // Emit memory warning if usage is high
    const heapUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
    if (heapUsagePercent > 0.8) {
      this.emit('memory-warning', {
        level: heapUsagePercent > 0.9 ? 'critical' : 'warning',
        usage: heapUsagePercent,
        metrics
      });
    }

    // Proactive memory optimization at 75%
    if (heapUsagePercent > 0.75 && heapUsagePercent < 0.8) {
      this.emit('memory-optimization-needed', {
        usage: heapUsagePercent,
        metrics
      });
    }

    // Log memory status
    if (heapUsagePercent > 0.7) {
      console.log(`📊 Memory Status: ${(heapUsagePercent * 100).toFixed(1)}% heap, ${(memUsage.rss / 1024 / 1024).toFixed(1)}MB RSS`);
    }
  }

  recordPerformanceMetrics(endpoint: string, method: string, responseTime: number, statusCode: number): void {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      responseTime,
      endpoint,
      method,
      statusCode
    };

    this.performanceMetrics.push(metrics);
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetricsHistory) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsHistory);
    }

    // Emit performance warning for slow responses
    if (responseTime > 1000) { // 1 second threshold
      this.emit('performance-warning', {
        endpoint,
        method,
        responseTime,
        statusCode
      });
    }
  }

  getMemoryTrends(): { trend: 'increasing' | 'decreasing' | 'stable'; change: number } {
    if (this.memoryMetrics.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const recent = this.memoryMetrics.slice(-5); // Last 5 measurements
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    const change = ((last - first) / first) * 100;

    if (change > 5) return { trend: 'increasing', change };
    if (change < -5) return { trend: 'decreasing', change };
    return { trend: 'stable', change };
  }

  getCurrentMemoryUsage(): MemoryMetrics | null {
    return this.memoryMetrics[this.memoryMetrics.length - 1] || null;
  }

  getMemoryHistory(): MemoryMetrics[] {
    return [...this.memoryMetrics];
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  getMemorySummary(): {
    current: MemoryMetrics | null;
    trend: { trend: 'increasing' | 'decreasing' | 'stable'; change: number };
    averageHeapUsage: number;
    peakHeapUsage: number;
    cacheEfficiency: number;
  } {
    const current = this.getCurrentMemoryUsage();
    const trend = this.getMemoryTrends();
    
    if (!current) {
      return {
        current: null,
        trend,
        averageHeapUsage: 0,
        peakHeapUsage: 0,
        cacheEfficiency: 0
      };
    }

    const heapUsages = this.memoryMetrics.map(m => m.heapUsed);
    const averageHeapUsage = heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length;
    const peakHeapUsage = Math.max(...heapUsages);

    // Calculate cache efficiency (lower is better - means less memory used)
    const cacheStats = current.cacheStats;
    const totalCacheSize = Object.values(cacheStats).reduce((total: number, cache: any) => {
      return total + (cache.size || 0);
    }, 0);
    const cacheEfficiency = totalCacheSize / 100; // Normalize to 0-1 scale

    return {
      current,
      trend,
      averageHeapUsage,
      peakHeapUsage,
      cacheEfficiency
    };
  }

  // Cleanup method
  destroy(): void {
    this.stopMonitoring();
    this.memoryMetrics = [];
    this.performanceMetrics = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Graceful shutdown
process.on('SIGTERM', () => {
  monitoringService.destroy();
});

process.on('SIGINT', () => {
  monitoringService.destroy();
});