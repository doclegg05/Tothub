import { memoryCache } from './simpleMemoryCache';
import { db } from '../db';
import { sql } from 'drizzle-orm';

interface MemoryOptimizationConfig {
  maxHeapUsage: number; // MB
  gcInterval: number; // minutes
  cacheCleanupThreshold: number; // percentage
  aggressiveMode: boolean;
}

class MemoryOptimizationService {
  private config: MemoryOptimizationConfig = {
    maxHeapUsage: 140, // Target max 140MB heap
    gcInterval: 2, // Run GC every 2 minutes
    cacheCleanupThreshold: 0.7, // Clean caches at 70% memory
    aggressiveMode: true
  };

  private gcIntervalId: NodeJS.Timeout | null = null;
  private cacheCleanupId: NodeJS.Timeout | null = null;

  constructor() {
    this.startOptimization();
  }

  private startOptimization(): void {
    console.log('🚀 Memory optimization service started');
    
    // Immediate cleanup
    this.performCleanup();
    
    // Regular garbage collection
    this.gcIntervalId = setInterval(() => {
      this.forceGarbageCollection();
    }, this.config.gcInterval * 60 * 1000);

    // Cache cleanup when memory pressure
    this.cacheCleanupId = setInterval(() => {
      this.checkMemoryPressure();
    }, 30 * 1000); // Check every 30 seconds
  }

  private getMemoryUsagePercent(): number {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    return usage.rss / totalMemory;
  }

  private forceGarbageCollection(): void {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed / 1024 / 1024;
      global.gc();
      const after = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`♻️ GC: ${before.toFixed(2)}MB → ${after.toFixed(2)}MB (freed ${(before - after).toFixed(2)}MB)`);
    }
  }

  private checkMemoryPressure(): void {
    const memPercent = this.getMemoryUsagePercent();
    
    if (memPercent > this.config.cacheCleanupThreshold) {
      console.log(`⚠️ Memory pressure detected: ${(memPercent * 100).toFixed(1)}%`);
      this.performCleanup();
    }
  }

  private performCleanup(): void {
    console.log('🧹 Performing memory cleanup...');
    
    // Clear all caches
    memoryCache.clearAllCaches();
    
    // Clear module cache for non-essential modules
    this.clearModuleCache();
    
    // Force immediate GC if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear any accumulated buffers
    this.clearBuffers();
    
    const after = process.memoryUsage();
    console.log(`✅ Cleanup complete. Current memory: RSS=${(after.rss / 1024 / 1024).toFixed(2)}MB, Heap=${(after.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  }

  private clearModuleCache(): void {
    // Clear require cache for non-critical modules
    const protectedModules = [
      'express', 'drizzle-orm', '@neondatabase/serverless',
      'path', 'fs', 'os', 'util', 'events', 'http', 'https'
    ];
    
    for (const key in require.cache) {
      const isProtected = protectedModules.some(mod => key.includes(mod));
      if (!isProtected && key.includes('node_modules')) {
        delete require.cache[key];
      }
    }
  }

  private clearBuffers(): void {
    // Clear any global buffers or arrays that might be holding memory
    if (global.Buffer) {
      // Force buffer pool to release unused memory
      global.Buffer.poolSize = 0;
    }
  }

  public async cleanupOldSessions(): Promise<void> {
    try {
      // Clean up old session data from database
      await db.execute(sql`DELETE FROM session_activity WHERE created_at < NOW() - INTERVAL '7 days'`);
      console.log('🗑️ Cleaned up old session data');
    } catch (error) {
      console.error('Error cleaning sessions:', error);
    }
  }

  public getMemoryStats() {
    const usage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    
    return {
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)}MB`,
      heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(usage.external / 1024 / 1024).toFixed(2)}MB`,
      percentage: `${(this.getMemoryUsagePercent() * 100).toFixed(1)}%`
    };
  }

  public stop(): void {
    if (this.gcIntervalId) {
      clearInterval(this.gcIntervalId);
    }
    if (this.cacheCleanupId) {
      clearInterval(this.cacheCleanupId);
    }
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizationService();