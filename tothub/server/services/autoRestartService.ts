import { exec } from 'child_process';
import { promisify } from 'util';
import { totalmem } from 'os';

const execAsync = promisify(exec);

interface RestartConfig {
  memoryThreshold: number; // Percentage (0-1)
  checkInterval: number; // Minutes
  cooldownPeriod: number; // Minutes
  enabled: boolean;
}

class AutoRestartService {
  private config: RestartConfig = {
    memoryThreshold: 0.80, // Restart at 80% memory usage (more aggressive)
    checkInterval: 1, // Check every 1 minute (more frequent monitoring)
    cooldownPeriod: 5, // Wait only 5 minutes between restarts (for development)
    enabled: true // Enable in both development and production
  };

  private lastRestartTime: Date | null = null;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private isRestarting = false;

  constructor() {
    // Start monitoring if enabled
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    // Use heapUsed instead of RSS for more accurate Node.js memory measurement
    // RSS includes memory allocated by the OS, heapUsed is actual JavaScript heap usage
    const totalMemory = totalmem();
    return memUsage.heapUsed / totalMemory;
  }

  private getMemoryUsageRSS(): number {
    const memUsage = process.memoryUsage();
    const totalMemory = totalmem();
    return memUsage.rss / totalMemory;
  }

  private canRestart(): boolean {
    if (!this.config.enabled || this.isRestarting) {
      return false;
    }

    if (!this.lastRestartTime) {
      return true;
    }

    const minutesSinceLastRestart = 
      (Date.now() - this.lastRestartTime.getTime()) / (1000 * 60);
    
    return minutesSinceLastRestart >= this.config.cooldownPeriod;
  }

  private async performRestart(): Promise<void> {
    if (!this.canRestart()) {
      return;
    }

    this.isRestarting = true;
    const memoryUsage = this.getMemoryUsage();
    const memoryUsageRSS = this.getMemoryUsageRSS();
    
    console.log(`🔄 Auto-restart triggered - Memory usage: ${(memoryUsage * 100).toFixed(1)}% (heap), ${(memoryUsageRSS * 100).toFixed(1)}% (RSS)`);
    console.log(`📊 Memory details:`, {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(process.memoryUsage().external / 1024 / 1024).toFixed(2)}MB`,
      threshold: `${(this.config.memoryThreshold * 100).toFixed(0)}%`
    });

    this.lastRestartTime = new Date();

    // Graceful shutdown
    console.log('🛑 Initiating graceful shutdown...');
    
    // Clear caches before restart
    try {
      const { memoryCache } = await import('./simpleMemoryCache');
      memoryCache.clearAllCaches();
      console.log('✅ Caches cleared successfully');
    } catch (error) {
      console.log('⚠️ Cache clearing failed:', error);
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('✅ Garbage collection completed');
    }

    // Give time for ongoing requests to complete
    setTimeout(() => {
      console.log('🔄 Restarting server...');
      process.exit(0); // Exit cleanly, supervisor will restart
    }, 3000); // Reduced from 5s to 3s
  }

  private async checkMemory(): Promise<void> {
    const memoryUsage = this.getMemoryUsage();
    const memoryUsageRSS = this.getMemoryUsageRSS();
    
    // Log memory status every check with more detail
    if (memoryUsage > 0.7) { // Log if above 70%
      console.log(`📊 Memory check: ${(memoryUsage * 100).toFixed(1)}% heap, ${(memoryUsageRSS * 100).toFixed(1)}% RSS`);
    }

    // Proactive memory optimization at 75%
    if (memoryUsage > 0.75 && memoryUsage < this.config.memoryThreshold) {
      console.log(`🔧 Proactive memory optimization triggered at ${(memoryUsage * 100).toFixed(1)}%`);
      await this.optimizeMemory();
    }

    // Check both heap and RSS usage
    if (memoryUsage > this.config.memoryThreshold || memoryUsageRSS > this.config.memoryThreshold) {
      console.log(`🚨 Memory threshold exceeded! Heap: ${(memoryUsage * 100).toFixed(1)}%, RSS: ${(memoryUsageRSS * 100).toFixed(1)}%`);
      await this.performRestart();
    }
  }

  private async optimizeMemory(): Promise<void> {
    try {
      // Clear caches
      const { memoryCache } = await import('./simpleMemoryCache');
      memoryCache.clearAllCaches();
      console.log('✅ Caches cleared during proactive optimization');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('✅ Garbage collection completed during proactive optimization');
      }
      
      // Small delay to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterOptimization = this.getMemoryUsage();
      console.log(`📊 Memory after optimization: ${(afterOptimization * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.log('⚠️ Memory optimization failed:', error);
    }
  }

  public startMonitoring(): void {
    if (this.checkIntervalId) {
      return; // Already monitoring
    }

    console.log('🚀 Auto-restart service started', {
      threshold: `${(this.config.memoryThreshold * 100).toFixed(0)}%`,
      checkInterval: `${this.config.checkInterval} minutes`,
      cooldown: `${this.config.cooldownPeriod} minutes`
    });

    // Initial check
    this.checkMemory();

    // Set up periodic checks
    this.checkIntervalId = setInterval(
      () => this.checkMemory(),
      this.config.checkInterval * 60 * 1000
    );
  }

  public stopMonitoring(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      console.log('🛑 Auto-restart service stopped');
    }
  }

  public updateConfig(newConfig: Partial<RestartConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...newConfig };

    // Restart monitoring if enabled state changed
    if (wasEnabled !== this.config.enabled) {
      if (this.config.enabled) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    } else if (this.config.enabled) {
      // Restart with new interval if changed
      this.stopMonitoring();
      this.startMonitoring();
    }

    console.log('⚙️ Auto-restart config updated:', this.config);
  }

  public getStatus() {
    return {
      enabled: this.config.enabled,
      memoryUsage: `${(this.getMemoryUsage() * 100).toFixed(1)}%`,
      threshold: `${(this.config.memoryThreshold * 100).toFixed(0)}%`,
      lastRestart: this.lastRestartTime?.toISOString() || 'Never',
      canRestartNow: this.canRestart(),
      nextCheckIn: this.checkIntervalId ? `${this.config.checkInterval} minutes` : 'Not scheduled'
    };
  }

  // Manual restart trigger
  public async triggerManualRestart(): Promise<void> {
    console.log('🔄 Manual restart requested');
    this.lastRestartTime = null; // Override cooldown for manual restart
    await this.performRestart();
  }

  // Force restart (ignores all checks)
  public async forceRestart(): Promise<void> {
    console.log('🔄 Force restart requested');
    this.isRestarting = true;
    this.lastRestartTime = null;
    await this.performRestart();
  }
}

// Singleton instance
export const autoRestartService = new AutoRestartService();

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  autoRestartService.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  autoRestartService.stopMonitoring();
  process.exit(0);
});