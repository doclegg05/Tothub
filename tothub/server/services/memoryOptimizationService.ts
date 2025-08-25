import { LRUCache } from 'lru-cache';

export interface MemoryCacheConfig {
  maxSize: number; // Maximum number of items
  maxAge: number; // Maximum age in milliseconds
  sizeCalculation?: (value: any, key: string) => number;
}

class MemoryOptimizationService {
  private caches: Map<string, LRUCache<string, any>> = new Map();
  private gcInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Start garbage collection optimization
    this.startGarbageCollectionOptimization();
  }

  createCache(name: string, config: MemoryCacheConfig): LRUCache<string, any> {
    const cache = new LRUCache<string, any>({
      max: config.maxSize,
      ttl: config.maxAge,
      sizeCalculation: config.sizeCalculation,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      // Automatically prune old entries
      ttlAutopurge: true,
    });

    this.caches.set(name, cache);
    return cache;
  }

  getCache(name: string): LRUCache<string, any> | undefined {
    return this.caches.get(name);
  }

  clearCache(name: string): void {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
    }
  }

  clearAllCaches(): void {
    console.log('🧹 Clearing all memory caches...');
    this.caches.forEach(cache => cache.clear());
  }

  getCacheStats(): { [key: string]: { size: number; maxSize: number } } {
    const stats: { [key: string]: { size: number; maxSize: number } } = {};
    this.caches.forEach((cache, name) => {
      stats[name] = {
        size: cache.size,
        maxSize: cache.max,
      };
    });
    return stats;
  }

  private startGarbageCollectionOptimization(): void {
    // Run garbage collection every 5 minutes
    this.gcInterval = setInterval(() => {
      this.optimizeMemory();
    }, 5 * 60 * 1000);

    // Also optimize on startup
    setTimeout(() => this.optimizeMemory(), 10000);
  }

  private optimizeMemory(): void {
    const before = process.memoryUsage();
    
    // Clear expired entries from all caches
    this.caches.forEach(cache => {
      cache.purgeStale();
    });

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const after = process.memoryUsage();
    const freed = (before.heapUsed - after.heapUsed) / 1024 / 1024;
    
    if (freed > 0) {
      console.log(`🧹 Memory optimization freed ${freed.toFixed(2)}MB`);
    }
  }

  destroy(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
    this.clearAllCaches();
  }
}

// Export singleton instance
export const memoryCache = new MemoryOptimizationService();

// Create optimized caches for different data types
export const childrenCache = memoryCache.createCache('children', {
  maxSize: 500, // Store max 500 children
  maxAge: 10 * 60 * 1000, // 10 minutes
});

export const staffCache = memoryCache.createCache('staff', {
  maxSize: 200, // Store max 200 staff
  maxAge: 10 * 60 * 1000, // 10 minutes
});

export const attendanceCache = memoryCache.createCache('attendance', {
  maxSize: 1000, // Store max 1000 attendance records
  maxAge: 5 * 60 * 1000, // 5 minutes (shorter as this changes frequently)
});

export const settingsCache = memoryCache.createCache('settings', {
  maxSize: 50, // Store max 50 settings
  maxAge: 30 * 60 * 1000, // 30 minutes
});