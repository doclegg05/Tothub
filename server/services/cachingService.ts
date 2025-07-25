import Redis from 'ioredis';

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  keyPrefix: string;
  defaultTTL: number; // seconds
  maxRetries: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  averageResponseTime: number;
}

export class CachingService {
  private static instance: CachingService;
  private redis: Redis;
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    averageResponseTime: 0,
  };
  private responseTimes: number[] = [];

  constructor(config: CacheConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      keyPrefix: config.keyPrefix,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: config.maxRetries,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  public static getInstance(config?: CacheConfig): CachingService {
    if (!CachingService.instance) {
      if (!config) {
        // Default configuration
        const defaultConfig: CacheConfig = {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          keyPrefix: 'tothub:',
          defaultTTL: 3600, // 1 hour
          maxRetries: 3,
        };
        config = defaultConfig;
      }
      CachingService.instance = new CachingService(config);
    }
    return CachingService.instance;
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis error:', error);
      this.metrics.errors++;
    });

    this.redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    this.redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });
  }

  // Generic cache operations
  public async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      const value = await this.redis.get(key);
      const responseTime = performance.now() - startTime;
      this.updateResponseTime(responseTime);
      
      if (value === null) {
        this.metrics.misses++;
        return null;
      }
      
      this.metrics.hits++;
      return JSON.parse(value);
    } catch (error) {
      this.metrics.errors++;
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const serialized = JSON.stringify(value);
      const result = ttl 
        ? await this.redis.setex(key, ttl, serialized)
        : await this.redis.set(key, serialized);
      
      const responseTime = performance.now() - startTime;
      this.updateResponseTime(responseTime);
      this.metrics.sets++;
      
      return result === 'OK';
    } catch (error) {
      this.metrics.errors++;
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  public async delete(key: string): Promise<boolean> {
    const startTime = performance.now();
    
    try {
      const result = await this.redis.del(key);
      const responseTime = performance.now() - startTime;
      this.updateResponseTime(responseTime);
      this.metrics.deletes++;
      
      return result > 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  public async flush(): Promise<boolean> {
    try {
      const result = await this.redis.flushdb();
      return result === 'OK';
    } catch (error) {
      this.metrics.errors++;
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Specialized daycare data caching methods

  // Cache children data with 15-minute TTL
  public async cacheChildren(children: any[]): Promise<void> {
    await this.set('children:list', children, 900); // 15 minutes
  }

  public async getCachedChildren(): Promise<any[] | null> {
    return this.get<any[]>('children:list');
  }

  // Cache staff data with 30-minute TTL
  public async cacheStaff(staff: any[]): Promise<void> {
    await this.set('staff:list', staff, 1800); // 30 minutes
  }

  public async getCachedStaff(): Promise<any[] | null> {
    return this.get<any[]>('staff:list');
  }

  // Cache attendance data with 5-minute TTL (more dynamic)
  public async cacheAttendance(date: string, attendance: any[]): Promise<void> {
    await this.set(`attendance:${date}`, attendance, 300); // 5 minutes
  }

  public async getCachedAttendance(date: string): Promise<any[] | null> {
    return this.get<any[]>(`attendance:${date}`);
  }

  // Cache ratios with 10-minute TTL
  public async cacheRatios(ratios: any[]): Promise<void> {
    await this.set('ratios:current', ratios, 600); // 10 minutes
  }

  public async getCachedRatios(): Promise<any[] | null> {
    return this.get<any[]>('ratios:current');
  }

  // Cache dashboard stats with 2-minute TTL
  public async cacheDashboardStats(stats: any): Promise<void> {
    await this.set('dashboard:stats', stats, 120); // 2 minutes
  }

  public async getCachedDashboardStats(): Promise<any | null> {
    return this.get<any>('dashboard:stats');
  }

  // Cache compliance data with 1-hour TTL
  public async cacheComplianceData(state: string, data: any): Promise<void> {
    await this.set(`compliance:${state}`, data, 3600); // 1 hour
  }

  public async getCachedComplianceData(state: string): Promise<any | null> {
    return this.get<any>(`compliance:${state}`);
  }

  // Cache payroll data with 4-hour TTL
  public async cachePayrollData(type: string, data: any): Promise<void> {
    await this.set(`payroll:${type}`, data, 14400); // 4 hours
  }

  public async getCachedPayrollData(type: string): Promise<any | null> {
    return this.get<any>(`payroll:${type}`);
  }

  // Cache-aside pattern helper
  public async cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();
    
    // Store in cache
    await this.set(key, data, ttl);
    
    return data;
  }

  // Pattern for write-through caching
  public async writeThrough<T>(
    key: string,
    data: T,
    persistFn: (data: T) => Promise<void>,
    ttl?: number
  ): Promise<void> {
    // Write to cache and database simultaneously
    await Promise.all([
      this.set(key, data, ttl),
      persistFn(data),
    ]);
  }

  // Pattern for write-behind caching (async write)
  public async writeBehind<T>(
    key: string,
    data: T,
    persistFn: (data: T) => Promise<void>,
    ttl?: number
  ): Promise<void> {
    // Write to cache immediately
    await this.set(key, data, ttl);
    
    // Write to database asynchronously
    setImmediate(async () => {
      try {
        await persistFn(data);
      } catch (error) {
        console.error('Write-behind cache persistence error:', error);
        // Could implement retry logic here
      }
    });
  }

  // Cache invalidation patterns
  public async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Cache invalidation error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  public async invalidateChildrenCache(): Promise<void> {
    await this.invalidatePattern('children:*');
  }

  public async invalidateStaffCache(): Promise<void> {
    await this.invalidatePattern('staff:*');
  }

  public async invalidateAttendanceCache(): Promise<void> {
    await this.invalidatePattern('attendance:*');
  }

  // Session management
  public async setSession(sessionId: string, data: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  public async getSession(sessionId: string): Promise<any | null> {
    return this.get<any>(`session:${sessionId}`);
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    return this.delete(`session:${sessionId}`);
  }

  // Rate limiting support
  public async incrementCounter(key: string, ttl: number): Promise<number> {
    try {
      const multi = this.redis.multi();
      multi.incr(key);
      multi.expire(key, ttl);
      const results = await multi.exec();
      
      return results?.[0]?.[1] as number || 0;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Counter increment error for key ${key}:`, error);
      return 0;
    }
  }

  // Lock mechanism for critical sections
  public async acquireLock(resource: string, ttl: number = 10): Promise<string | null> {
    try {
      const lockKey = `lock:${resource}`;
      const lockValue = `${Date.now()}-${Math.random()}`;
      
      const result = await this.redis.set(lockKey, lockValue, 'EX', ttl, 'NX');
      return result === 'OK' ? lockValue : null;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Lock acquisition error for resource ${resource}:`, error);
      return null;
    }
  }

  public async releaseLock(resource: string, lockValue: string): Promise<boolean> {
    try {
      const lockKey = `lock:${resource}`;
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.redis.eval(script, 1, lockKey, lockValue);
      return result === 1;
    } catch (error) {
      this.metrics.errors++;
      console.error(`Lock release error for resource ${resource}:`, error);
      return false;
    }
  }

  // Pub/Sub for real-time updates
  public async publish(channel: string, message: any): Promise<number> {
    try {
      const serialized = JSON.stringify(message);
      return await this.redis.publish(channel, serialized);
    } catch (error) {
      this.metrics.errors++;
      console.error(`Publish error for channel ${channel}:`, error);
      return 0;
    }
  }

  public subscribe(channel: string, callback: (message: any) => void): void {
    const subscriber = new Redis({
      host: this.redis.options.host,
      port: this.redis.options.port,
      password: this.redis.options.password,
    });

    subscriber.subscribe(channel);
    subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          callback(parsed);
        } catch (error) {
          console.error('Message parsing error:', error);
        }
      }
    });
  }

  // Health check
  public async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number; details: any }> {
    const startTime = performance.now();
    
    try {
      await this.redis.ping();
      const latency = performance.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
        details: {
          connected: true,
          metrics: this.getMetrics(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: performance.now() - startTime,
        details: {
          connected: false,
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  // Metrics and monitoring
  private updateResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
    
    // Update average
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
  }

  public getMetrics(): CacheMetrics & { hitRate: number; errorRate: number } {
    const totalOperations = this.metrics.hits + this.metrics.misses;
    const hitRate = totalOperations > 0 ? this.metrics.hits / totalOperations : 0;
    const errorRate = this.metrics.errors / Math.max(1, this.metrics.sets + this.metrics.deletes + totalOperations);
    
    return {
      ...this.metrics,
      hitRate,
      errorRate,
    };
  }

  public resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      averageResponseTime: 0,
    };
    this.responseTimes = [];
  }

  // Warm up cache with frequently accessed data
  public async warmUpCache(): Promise<void> {
    console.log('🔥 Warming up cache...');
    
    try {
      // This would typically fetch and cache frequently accessed data
      // For example, today's attendance, current staff, etc.
      const warmupOperations = [
        // Cache current date attendance
        this.cacheAttendance(new Date().toISOString().split('T')[0], []),
        
        // Cache common lookup data that doesn't change often
        this.set('app:version', process.env.npm_package_version || '1.0.0', 86400),
        this.set('app:started', new Date().toISOString(), 86400),
      ];
      
      await Promise.all(warmupOperations);
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.error('❌ Cache warmup failed:', error);
    }
  }

  // Cleanup and shutdown
  public async shutdown(): Promise<void> {
    try {
      await this.redis.quit();
      console.log('✅ Redis connection closed gracefully');
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }
  }
}