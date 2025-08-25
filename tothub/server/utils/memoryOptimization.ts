import { EventEmitter } from 'events';

interface MemoryOptimizationConfig {
  maxBatchSize: number;
  delayBetweenBatches: number;
  maxConcurrentBatches: number;
  enableGarbageCollection: boolean;
}

interface BatchProcessingResult<T> {
  success: boolean;
  data: T[];
  error?: string;
  memoryBefore: number;
  memoryAfter: number;
  processingTime: number;
}

class MemoryOptimizationUtility extends EventEmitter {
  private config: MemoryOptimizationConfig;
  private activeBatches = 0;
  private isProcessing = false;

  constructor(config?: Partial<MemoryOptimizationConfig>) {
    super();
    this.config = {
      maxBatchSize: 100,
      delayBetweenBatches: 100,
      maxConcurrentBatches: 3,
      enableGarbageCollection: true,
      ...config
    };
  }

  // Process large arrays in memory-efficient batches
  async processInBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    options?: Partial<MemoryOptimizationConfig>
  ): Promise<R[]> {
    const config = { ...this.config, ...options };
    const results: R[] = [];
    const batches = this.createBatches(items, config.maxBatchSize);
    
    console.log(`🔄 Processing ${items.length} items in ${batches.length} batches of ${config.maxBatchSize}`);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchStartTime = Date.now();
      const memoryBefore = this.getMemoryUsage();
      
      try {
        // Wait if we have too many concurrent batches
        while (this.activeBatches >= config.maxConcurrentBatches) {
          await this.delay(50);
        }
        
        this.activeBatches++;
        this.isProcessing = true;
        
        // Process the batch
        const batchResults = await processor(batch);
        results.push(...batchResults);
        
        const memoryAfter = this.getMemoryUsage();
        const processingTime = Date.now() - batchStartTime;
        
        // Emit batch completion event
        this.emit('batch-completed', {
          batchIndex: i,
          batchSize: batch.length,
          resultsCount: batchResults.length,
          memoryBefore,
          memoryAfter,
          processingTime
        });
        
        // Log batch progress
        console.log(`✅ Batch ${i + 1}/${batches.length} completed: ${batch.length} items in ${processingTime}ms`);
        
        // Memory optimization between batches
        if (config.enableGarbageCollection) {
          await this.optimizeMemory();
        }
        
        // Delay between batches to allow memory cleanup
        if (i < batches.length - 1) {
          await this.delay(config.delayBetweenBatches);
        }
        
      } catch (error) {
        console.error(`❌ Error processing batch ${i + 1}:`, error);
        this.emit('batch-error', {
          batchIndex: i,
          batchSize: batch.length,
          error: error instanceof Error ? error.message : String(error)
        });
      } finally {
        this.activeBatches--;
      }
    }
    
    this.isProcessing = false;
    console.log(`🎉 All batches completed. Total results: ${results.length}`);
    
    return results;
  }

  // Process items with memory monitoring
  async processWithMemoryMonitoring<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options?: Partial<MemoryOptimizationConfig>
  ): Promise<R[]> {
    const config = { ...this.config, ...options };
    const results: R[] = [];
    const memoryThreshold = 0.8; // 80% memory usage threshold
    
    console.log(`📊 Processing ${items.length} items with memory monitoring`);
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const memoryUsage = this.getMemoryUsage();
      
      // Check memory threshold
      if (memoryUsage > memoryThreshold) {
        console.warn(`⚠️ High memory usage (${(memoryUsage * 100).toFixed(1)}%) - pausing for cleanup`);
        await this.optimizeMemory();
        
        // Check again after cleanup
        if (this.getMemoryUsage() > memoryThreshold) {
          console.error(`🚨 Memory usage still high after cleanup - stopping processing`);
          break;
        }
      }
      
      try {
        const result = await processor(item);
        results.push(result);
        
        // Progress logging
        if ((i + 1) % 50 === 0) {
          console.log(`📈 Progress: ${i + 1}/${items.length} (${((i + 1) / items.length * 100).toFixed(1)}%)`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing item ${i}:`, error);
        this.emit('item-error', { index: i, item, error });
      }
    }
    
    return results;
  }

  // Stream processing for very large datasets
  async *processAsStream<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 50
  ): AsyncGenerator<R, void, unknown> {
    const batches = this.createBatches(items, batchSize);
    
    for (const batch of batches) {
      const batchPromises = batch.map(item => processor(item));
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        yield result;
      }
      
      // Memory cleanup between batches
      await this.optimizeMemory();
    }
  }

  // Memory optimization methods
  private async optimizeMemory(): Promise<void> {
    const before = this.getMemoryUsage();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Small delay to allow cleanup
    await this.delay(10);
    
    const after = this.getMemoryUsage();
    const improvement = before - after;
    
    if (improvement > 0.01) { // 1% improvement
      console.log(`🧹 Memory optimization: ${(improvement * 100).toFixed(2)}% improvement`);
    }
  }

  // Utility methods
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed / memUsage.heapTotal;
  }

  // Get current processing status
  getStatus(): {
    isProcessing: boolean;
    activeBatches: number;
    maxConcurrentBatches: number;
    memoryUsage: number;
  } {
    return {
      isProcessing: this.isProcessing,
      activeBatches: this.activeBatches,
      maxConcurrentBatches: this.config.maxConcurrentBatches,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<MemoryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Memory optimization config updated:', this.config);
  }

  // Cleanup method
  destroy(): void {
    this.isProcessing = false;
    this.activeBatches = 0;
    this.removeAllListeners();
  }
}

// Export singleton instance
export const memoryOptimizer = new MemoryOptimizationUtility();

// Export utility functions for direct use
export async function processInBatches<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  batchSize: number = 100
): Promise<R[]> {
  return memoryOptimizer.processInBatches(items, processor, { maxBatchSize: batchSize });
}

export async function processWithMemoryMonitoring<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options?: Partial<MemoryOptimizationConfig>
): Promise<R[]> {
  return memoryOptimizer.processWithMemoryMonitoring(items, processor, options);
}

export async function* processAsStream<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 50
): AsyncGenerator<R, void, unknown> {
  yield* memoryOptimizer.processAsStream(items, processor, batchSize);
}
