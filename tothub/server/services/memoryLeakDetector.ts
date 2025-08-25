import { EventEmitter } from 'events';
import { monitoringService } from './monitoringService';

interface MemorySnapshot {
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  arrayBuffers: number;
}

interface LeakDetectionResult {
  hasLeak: boolean;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  recommendations: string[];
}

class MemoryLeakDetector extends EventEmitter {
  private snapshots: MemorySnapshot[] = [];
  private maxSnapshots = 50; // Keep last 50 snapshots
  private detectionInterval: NodeJS.Timeout | null = null;
  private isDetecting = false;
  private leakThreshold = 0.1; // 10% increase over time indicates potential leak

  constructor() {
    super();
    this.startDetection();
  }

  startDetection(): void {
    if (this.isDetecting) return;

    this.isDetecting = true;
    console.log('🔍 Memory leak detection service started');

    // Take snapshots every minute
    this.detectionInterval = setInterval(() => {
      this.takeSnapshot();
      this.analyzeForLeaks();
    }, 60000);

    // Initial snapshot
    setTimeout(() => this.takeSnapshot(), 5000);
  }

  stopDetection(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.isDetecting = false;
    console.log('🔍 Memory leak detection service stopped');
  }

  private takeSnapshot(): void {
    const memUsage = process.memoryUsage();
    const snapshot: MemorySnapshot = {
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      rss: memUsage.rss,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers
    };

    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
  }

  private analyzeForLeaks(): LeakDetectionResult {
    if (this.snapshots.length < 3) {
      return {
        hasLeak: false,
        confidence: 0,
        trend: 'stable',
        changePercent: 0,
        recommendations: ['Need more data for analysis']
      };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    // Calculate change over time
    const timeDiff = last.timestamp.getTime() - first.timestamp.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Calculate percentage change
    const heapChangePercent = ((last.heapUsed - first.heapUsed) / first.heapUsed) * 100;
    const rssChangePercent = ((last.rss - first.rss) / first.rss) * 100;
    
    // Determine trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (heapChangePercent > this.leakThreshold) trend = 'increasing';
    else if (heapChangePercent < -this.leakThreshold) trend = 'decreasing';
    
    // Calculate confidence based on consistency of trend
    const increasingSnapshots = recent.filter((_, i) => {
      if (i === 0) return false;
      return recent[i].heapUsed > recent[i-1].heapUsed;
    }).length;
    
    const confidence = (increasingSnapshots / (recent.length - 1)) * 100;
    
    // Determine if there's a leak
    const hasLeak = trend === 'increasing' && confidence > 70 && heapChangePercent > 5;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (hasLeak) {
      recommendations.push('Memory leak detected - consider restarting the service');
      recommendations.push('Check for unclosed database connections');
      recommendations.push('Review cache expiration settings');
      recommendations.push('Monitor for large data processing operations');
    } else if (trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - monitor closely');
      recommendations.push('Consider implementing memory limits on large operations');
    } else if (trend === 'decreasing') {
      recommendations.push('Memory usage is decreasing - system is healthy');
    }
    
    // Emit leak warning if detected
    if (hasLeak) {
      this.emit('leak-detected', {
        level: heapChangePercent > 20 ? 'critical' : 'warning',
        changePercent: heapChangePercent,
        confidence,
        recommendations
      });
    }

    return {
      hasLeak,
      confidence,
      trend,
      changePercent: heapChangePercent,
      recommendations
    };
  }

  // Manual leak analysis
  analyzeLeaks(): LeakDetectionResult {
    return this.analyzeForLeaks();
  }

  // Get memory growth rate
  getMemoryGrowthRate(): { rate: number; unit: string } {
    if (this.snapshots.length < 2) {
      return { rate: 0, unit: 'MB/hour' };
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    const timeDiff = last.timestamp.getTime() - first.timestamp.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff === 0) return { rate: 0, unit: 'MB/hour' };
    
    const memoryDiff = last.heapUsed - first.heapUsed;
    const rate = (memoryDiff / 1024 / 1024) / hoursDiff; // MB per hour
    
    return { rate, unit: 'MB/hour' };
  }

  // Get memory usage patterns
  getMemoryPatterns(): {
    peakUsage: number;
    averageUsage: number;
    usageVariance: number;
    growthTrend: 'linear' | 'exponential' | 'stable';
  } {
    if (this.snapshots.length < 3) {
      return {
        peakUsage: 0,
        averageUsage: 0,
        usageVariance: 0,
        growthTrend: 'stable'
      };
    }

    const heapUsages = this.snapshots.map(s => s.heapUsed);
    const peakUsage = Math.max(...heapUsages);
    const averageUsage = heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length;
    
    // Calculate variance
    const variance = heapUsages.reduce((sum, usage) => {
      return sum + Math.pow(usage - averageUsage, 2);
    }, 0) / heapUsages.length;
    
    // Determine growth trend
    const recent = this.snapshots.slice(-5);
    const growthRates = [];
    
    for (let i = 1; i < recent.length; i++) {
      const rate = (recent[i].heapUsed - recent[i-1].heapUsed) / recent[i-1].heapUsed;
      growthRates.push(rate);
    }
    
    const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;
    let growthTrend: 'linear' | 'exponential' | 'stable' = 'stable';
    
    if (avgGrowthRate > 0.05) growthTrend = 'exponential';
    else if (avgGrowthRate > 0.01) growthTrend = 'linear';
    
    return {
      peakUsage,
      averageUsage,
      usageVariance: variance,
      growthTrend
    };
  }

  // Cleanup method
  destroy(): void {
    this.stopDetection();
    this.snapshots = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();

// Graceful shutdown
process.on('SIGTERM', () => {
  memoryLeakDetector.destroy();
});

process.on('SIGINT', () => {
  memoryLeakDetector.destroy();
});
