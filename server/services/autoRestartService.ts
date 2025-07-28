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
    memoryThreshold: 0.85, // Restart at 85% memory usage
    checkInterval: 5, // Check every 5 minutes
    cooldownPeriod: 30, // Wait 30 minutes between restarts
    enabled: true
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
    
    console.log(`🔄 Auto-restart triggered - Memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
    console.log(`📊 Memory details:`, {
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`,
      heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
      threshold: `${(this.config.memoryThreshold * 100).toFixed(0)}%`
    });

    this.lastRestartTime = new Date();

    // Graceful shutdown
    console.log('🛑 Initiating graceful shutdown...');
    
    // Clear caches before restart
    try {
      const { memoryCache } = await import('./memoryOptimizationService');
      memoryCache.clearAllCaches();
    } catch (error) {
      console.log('Cache clearing skipped:', error);
    }

    // Give time for ongoing requests to complete
    setTimeout(() => {
      console.log('🔄 Restarting server...');
      process.exit(0); // Exit cleanly, supervisor will restart
    }, 5000);
  }

  private async checkMemory(): Promise<void> {
    const memoryUsage = this.getMemoryUsage();
    
    // Log memory status every check
    if (memoryUsage > 0.7) { // Log if above 70%
      console.log(`📊 Memory check: ${(memoryUsage * 100).toFixed(1)}% used`);
    }

    if (memoryUsage > this.config.memoryThreshold) {
      await this.performRestart();
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