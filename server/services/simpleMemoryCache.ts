// Simple in-memory cache to avoid circular dependencies
import { LRUCache } from 'lru-cache';

interface CacheOptions {
  max: number;
  ttl: number; // milliseconds
}

class SimpleMemoryCache {
  private children: LRUCache<string, any>;
  private staff: LRUCache<string, any>;
  private attendance: LRUCache<string, any>;
  private stateRatios: LRUCache<string, any>;

  constructor() {
    const options: CacheOptions = {
      max: 1000,
      ttl: 15 * 60 * 1000 // 15 minutes
    };

    this.children = new LRUCache(options);
    this.staff = new LRUCache(options);
    this.attendance = new LRUCache(options);
    this.stateRatios = new LRUCache(options);
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
  clearAllCaches(): void {
    this.children.clear();
    this.staff.clear();
    this.attendance.clear();
    this.stateRatios.clear();
    console.log('🗑️ All caches cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      children: {
        size: this.children.size,
        calculatedSize: this.children.calculatedSize
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