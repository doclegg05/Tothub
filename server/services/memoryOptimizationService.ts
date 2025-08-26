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

    // Apply env-driven sizing, if provided
    const maxCaches = parseInt(process.env.MEMORY_CACHE_MAX_ITEMS || '', 10);
    const ttlMs = parseInt(process.env.MEMORY_CACHE_TTL_MS || '', 10);
    if (!Number.isNaN(maxCaches) || !Number.isNaN(ttlMs)) {
      // Recreate default caches with env overrides
      this.reconfigureDefaultCaches(maxCaches, ttlMs);
    }
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

  private reconfigureDefaultCaches(maxOverride?: number, ttlOverrideMs?: number): void {
    const getMax = (fallback: number) => (Number.isFinite(maxOverride) && maxOverride! > 0 ? maxOverride! : fallback);
    const getTtl = (fallbackMs: number) => (Number.isFinite(ttlOverrideMs) && ttlOverrideMs! > 0 ? ttlOverrideMs! : fallbackMs);

    // Replace default caches if they already exist
    this.caches.set('children', new LRUCache<string, any>({
      max: getMax(500),
      ttl: getTtl(10 * 60 * 1000),
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      ttlAutopurge: true,
    }));

    this.caches.set('staff', new LRUCache<string, any>({
      max: getMax(200),
      ttl: getTtl(10 * 60 * 1000),
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      ttlAutopurge: true,
    }));

    this.caches.set('attendance', new LRUCache<string, any>({
      max: getMax(1000),
      ttl: getTtl(5 * 60 * 1000),
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      ttlAutopurge: true,
    }));

    this.caches.set('settings', new LRUCache<string, any>({
      max: getMax(50),
      ttl: getTtl(30 * 60 * 1000),
      updateAgeOnGet: true,
      updateAgeOnHas: true,
      ttlAutopurge: true,
    }));
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