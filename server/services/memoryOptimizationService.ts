import { LRUCache } from 'lru-cache';

// Simple in-memory LRU cache for frequently accessed data
export class MemoryCacheService {
  private childrenCache: LRUCache<string, any>;
  private staffCache: LRUCache<string, any>;
  private attendanceCache: LRUCache<string, any>;
  private stateRatiosCache: LRUCache<string, any>;

  constructor() {
    const options = {
      max: 500, // Maximum number of items
      ttl: 1000 * 60 * 5, // 5 minutes TTL
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    };

    this.childrenCache = new LRUCache(options);
    this.staffCache = new LRUCache(options);
    this.attendanceCache = new LRUCache({
      ...options,
      ttl: 1000 * 60 * 2, // 2 minutes for attendance (more dynamic)
    });
    this.stateRatiosCache = new LRUCache({
      ...options,
      ttl: 1000 * 60 * 60 * 24, // 24 hours for state ratios (rarely changes)
    });
  }

  // Children cache methods
  getChild(id: string): any {
    return this.childrenCache.get(id);
  }

  setChild(id: string, data: any): void {
    this.childrenCache.set(id, data);
  }

  deleteChild(id: string): void {
    this.childrenCache.delete(id);
  }

  clearChildrenCache(): void {
    this.childrenCache.clear();
  }

  // Staff cache methods
  getStaff(id: string): any {
    return this.staffCache.get(id);
  }

  setStaff(id: string, data: any): void {
    this.staffCache.set(id, data);
  }

  deleteStaff(id: string): void {
    this.staffCache.delete(id);
  }

  clearStaffCache(): void {
    this.staffCache.clear();
  }

  // Attendance cache methods
  getAttendance(key: string): any {
    return this.attendanceCache.get(key);
  }

  setAttendance(key: string, data: any): void {
    this.attendanceCache.set(key, data);
  }

  clearAttendanceCache(): void {
    this.attendanceCache.clear();
  }

  // State ratios cache
  getStateRatio(state: string): any {
    return this.stateRatiosCache.get(state);
  }

  setStateRatio(state: string, data: any): void {
    this.stateRatiosCache.set(state, data);
  }

  // Clear all caches
  clearAllCaches(): void {
    this.childrenCache.clear();
    this.staffCache.clear();
    this.attendanceCache.clear();
    this.stateRatiosCache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      children: {
        size: this.childrenCache.size,
        calculatedSize: this.childrenCache.calculatedSize,
      },
      staff: {
        size: this.staffCache.size,
        calculatedSize: this.staffCache.calculatedSize,
      },
      attendance: {
        size: this.attendanceCache.size,
        calculatedSize: this.attendanceCache.calculatedSize,
      },
      stateRatios: {
        size: this.stateRatiosCache.size,
        calculatedSize: this.stateRatiosCache.calculatedSize,
      },
    };
  }
}

// Singleton instance
export const memoryCache = new MemoryCacheService();