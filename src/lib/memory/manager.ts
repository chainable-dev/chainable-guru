import { MemoryStore, MemoryType, MemoryConfig, MemoryStats } from './types';

export class MemoryManager {
  private stores: Map<MemoryType, MemoryStore> = new Map();
  private metrics: Map<MemoryType, MemoryStats> = new Map();
  private lastCleanup: number = Date.now();
  private cleanupInterval: number = 1000 * 60 * 15; // 15 minutes

  constructor(config: MemoryConfig) {
    this.stores.set('short', config.shortTerm);
    this.stores.set('long', config.longTerm);
    this.stores.set('working', config.working);
    this.startMonitoring();
  }

  private async startMonitoring() {
    setInterval(async () => {
      await this.updateMetrics();
      await this.performCleanup();
    }, 1000 * 60); // Every minute
  }

  private async updateMetrics() {
    for (const [type, store] of this.stores.entries()) {
      try {
        const stats = await store.getStats();
        this.metrics.set(type, stats);
      } catch (error) {
        console.error(`Failed to update metrics for ${type}:`, error);
      }
    }
  }

  private async performCleanup() {
    const now = Date.now();
    if (now - this.lastCleanup >= this.cleanupInterval) {
      for (const [type, store] of this.stores.entries()) {
        try {
          await store.cleanup();
        } catch (error) {
          console.error(`Cleanup failed for ${type}:`, error);
        }
      }
      this.lastCleanup = now;
    }
  }

  async storeMemory(
    type: MemoryType,
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    const store = this.stores.get(type);
    if (!store) throw new Error(`Invalid memory type: ${type}`);
    
    const start = performance.now();
    try {
      await store.set(key, value, ttl);
    } finally {
      const duration = performance.now() - start;
      this.updateOperationMetrics(type, 'write', duration);
    }
  }

  async retrieveMemory(
    type: MemoryType,
    key: string
  ): Promise<any> {
    const store = this.stores.get(type);
    if (!store) throw new Error(`Invalid memory type: ${type}`);
    
    const start = performance.now();
    try {
      return await store.get(key);
    } finally {
      const duration = performance.now() - start;
      this.updateOperationMetrics(type, 'read', duration);
    }
  }

  private updateOperationMetrics(type: MemoryType, operation: 'read' | 'write', duration: number) {
    const currentStats = this.metrics.get(type) || {
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      itemCount: 0,
      cacheHitRate: 0,
      averageResponseTime: 0
    };
    
    // Update average response time
    const oldTotal = currentStats.averageResponseTime * currentStats.itemCount;
    currentStats.itemCount++;
    currentStats.averageResponseTime = (oldTotal + duration) / currentStats.itemCount;
    
    this.metrics.set(type, currentStats);
  }

  async getMetrics(): Promise<Record<MemoryType, MemoryStats>> {
    const metrics: Partial<Record<MemoryType, MemoryStats>> = {};
    for (const [type, store] of this.stores.entries()) {
      metrics[type] = await store.getStats();
    }
    return metrics as Record<MemoryType, MemoryStats>;
  }

  async clearMemory(
    type: MemoryType,
    pattern?: string
  ): Promise<void> {
    const store = this.stores.get(type);
    if (!store) throw new Error(`Invalid memory type: ${type}`);
    await store.clear(pattern);
  }
} 