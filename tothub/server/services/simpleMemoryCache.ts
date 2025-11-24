// Simple in-memory cache to avoid circular dependencies
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max: number;
  ttl: number; // milliseconds
}

class SimpleMemoryCache {
  private children: LRUCache<string, any>;
  private childrenPages: LRUCache<string, any>; // For paginated results
  private staff: LRUCache<string, any>;
  private attendance: LRUCache<string, any>;
  private stateRatios: LRUCache<string, any>;

  constructor() {
    // Reduce cache sizes to save memory
    const childrenOptions: CacheOptions = {
      max: 100, // Reduced from 200
      ttl: 3 * 60 * 1000 // 3 minutes (shorter for frequently changing data)
    };

    const childrenPagesOptions: CacheOptions = {
      max: 50, // Cache only 50 page results
      ttl: 2 * 60 * 1000 // 2 minutes (very short for pagination)
    };

    const staffOptions: CacheOptions = {
      max: 50, // Reduced from 100
      ttl: 5 * 60 * 1000 // 5 minutes
    };

    const attendanceOptions: CacheOptions = {
      max: 150, // Reduced from 300
      ttl: 2 * 60 * 1000 // 2 minutes (shorter as this changes frequently)
    };

    const stateRatiosOptions: CacheOptions = {
      max: 25, // Reduced from 50
      ttl: 15 * 60 * 1000 // 15 minutes (reduced from 30)
    };

    this.children = new LRUCache(childrenOptions);
    this.childrenPages = new LRUCache(childrenPagesOptions);
    this.staff = new LRUCache(staffOptions);
    this.attendance = new LRUCache(attendanceOptions);
    this.stateRatios = new LRUCache(stateRatiosOptions);
  }

  // Children cache methods
  getChild(id: string): any {
    return this.children.get(id);
  }

  setChild(id: string, data: any): void {
    this.children.set(id, data);
  }

  deleteChild(id: string): void {
    this.children.delete(id);
  }

  clearChildrenCache(): void {
    this.children.clear();
    this.childrenPages.clear(); // Also clear page cache
  }

  // Children page cache methods
  getChildrenCache(key: string): any {
    return this.childrenPages.get(key);
  }

  setChildrenCache(key: string, data: any, ttl?: number): void {
    if (ttl) {
      this.childrenPages.set(key, data, { ttl });
    } else {
      this.childrenPages.set(key, data);
    }
  }

  // Staff cache methods
  getStaff(id: string): any {
    return this.staff.get(id);
  }

  setStaff(id: string, data: any): void {
    this.staff.set(id, data);
  }

  deleteStaff(id: string): void {
    this.staff.delete(id);
  }

  clearStaffCache(): void {
    this.staff.clear();
  }

  // Cache statistics methods
  getChildrenCacheStats() {
    return {
      hits: 0, // TODO: Track hits
      misses: 0, // TODO: Track misses
      size: this.children.size,
      max: this.children.max,
      pageSize: this.childrenPages.size,
      pageMax: this.childrenPages.max
    };
  }

  getStaffCacheStats() {
    return {
      hits: 0,
      misses: 0,
      size: this.staff.size,
      max: this.staff.max
    };
  }

  getAttendanceCacheStats() {
    return {
      hits: 0,
      misses: 0,
      size: this.attendance.size,
      max: this.attendance.max
    };
  }

  getStateRatiosCacheStats() {
    return {
      hits: 0,
      misses: 0,
      size: this.stateRatios.size,
      max: this.stateRatios.max
    };
  }

  clearCaches(): void {
    this.children.clear();
    this.staff.clear();
    this.attendance.clear();
    this.stateRatios.clear();
  }

  // Attendance cache methods
  getAttendance(key: string): any {
    return this.attendance.get(key);
  }

  setAttendance(key: string, data: any): void {
    this.attendance.set(key, data);
  }

  clearAttendanceCache(): void {
    this.attendance.clear();
  }

  // State ratios cache methods
  getStateRatio(state: string): any {
    return this.stateRatios.get(state);
  }

  setStateRatio(state: string, data: any): void {
    this.stateRatios.set(state, data);
  }

  clearStateRatiosCache(): void {
    this.stateRatios.clear();
  }

  // Clear all caches
  // alias to maintain backwards compatibility
  clearAllCaches(): void {
    this.clearCaches();
    console.log('🗑️ All caches cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      children: {
        size: this.children.size,
        calculatedSize: this.children.calculatedSize,
        pageSize: this.childrenPages.size,
        pageCalculatedSize: this.childrenPages.calculatedSize
      },
      staff: {
        size: this.staff.size,
        calculatedSize: this.staff.calculatedSize
      },
      attendance: {
        size: this.attendance.size,
        calculatedSize: this.attendance.calculatedSize
      },
      stateRatios: {
        size: this.stateRatios.size,
        calculatedSize: this.stateRatios.calculatedSize
      }
    };
  }
}

// Export singleton instance
export const memoryCache = new SimpleMemoryCache();