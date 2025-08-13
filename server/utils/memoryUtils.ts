// Memory optimization utilities
import { totalmem } from 'os';

declare global {
  // eslint-disable-next-line no-var
  var __cleanup: (() => void) | undefined;
}

export function runGarbageCollection(): void {
  if (typeof global.gc === 'function') {
    global.gc();
    console.log('✅ Manual garbage collection completed');
  }
}

export function getMemoryUsageReport() {
  const used = process.memoryUsage();
  const totalMem = totalmem();
  
  return {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(used.external / 1024 / 1024)}MB`,
    arrayBuffers: `${Math.round(used.arrayBuffers / 1024 / 1024)}MB`,
    systemTotal: `${Math.round(totalMem / 1024 / 1024)}MB`,
    percentUsed: `${((used.rss / totalMem) * 100).toFixed(2)}%`
  };
}

// Clean up large objects from memory
export function cleanupLargeObjects(): void {
  // Force cleanup of any global objects
  if (global.__cleanup) {
    global.__cleanup();
  }
  
  // Clear module cache for non-essential modules
  const modulesToClear = ['../services/reportGenerator', '../services/emailService'];
  modulesToClear.forEach(modulePath => {
    try {
      const resolvedPath = require.resolve(modulePath);
      if (require.cache[resolvedPath]) {
        delete require.cache[resolvedPath];
      }
    } catch (e) {
      // Module not loaded, ignore
    }
  });
}

// Memory-efficient array processing
export function* chunkArray<T>(array: T[], chunkSize: number): Generator<T[], void, unknown> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

// Process large datasets in batches to avoid memory spikes
export async function processBatched<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  // Process in chunks without using generator
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
    
    // Allow garbage collection between batches
    await new Promise(resolve => setImmediate(resolve));
  }
  
  return results;
}