import { MemoryStore, MemoryType, MemoryConfig, MemoryStats } from './types';
import { BlobMemoryStore } from './blob-store';

interface FileOperationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalSize: number;
  cacheHitRate: number;
}

export class MemoryManager {
  private stores: Map<MemoryType, MemoryStore> = new Map();
  private metrics: Map<MemoryType, MemoryStats> = new Map();
  private lastCleanup: number = Date.now();
  private cleanupInterval: number = 1000 * 60 * 15; // 15 minutes
  private fileMetrics: Map<string, FileOperationMetrics> = new Map();

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

  async uploadFile(file: File, chatId: string): Promise<string> {
    const store = this.stores.get('long') as BlobMemoryStore;
    if (!store || !('uploadFile' in store)) {
      throw new Error('Long-term store does not support file uploads');
    }
    return store.uploadFile(file, chatId);
  }

  async getFile(chatId: string, filename: string) {
    const store = this.stores.get('long') as BlobMemoryStore;
    if (!store || !('getFile' in store)) {
      throw new Error('Long-term store does not support file retrieval');
    }
    return store.getFile(chatId, filename);
  }

  async listFiles(chatId: string) {
    const store = this.stores.get('long') as BlobMemoryStore;
    if (!store || !('listFiles' in store)) {
      throw new Error('Long-term store does not support file listing');
    }
    return store.listFiles(chatId);
  }

  async deleteFile(chatId: string, filename: string) {
    const store = this.stores.get('long') as BlobMemoryStore;
    if (!store || !('deleteFile' in store)) {
      throw new Error('Long-term store does not support file deletion');
    }
    return store.deleteFile(chatId, filename);
  }

  private initializeMetrics(userId: string) {
    if (!this.fileMetrics.has(userId)) {
      this.fileMetrics.set(userId, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        totalSize: 0,
        cacheHitRate: 0
      });
    }
  }

  private updateFileMetrics(userId: string, {
    success,
    responseTime,
    size,
    cacheHit
  }: {
    success: boolean;
    responseTime: number;
    size?: number;
    cacheHit?: boolean;
  }) {
    this.initializeMetrics(userId);
    const metrics = this.fileMetrics.get(userId)!;
    
    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    }

    // Update average response time
    metrics.averageResponseTime = (
      (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) / 
      metrics.totalRequests
    );

    if (size) {
      metrics.totalSize += size;
    }

    if (cacheHit !== undefined) {
      const totalCacheRequests = metrics.totalRequests;
      const totalHits = (metrics.cacheHitRate * (totalCacheRequests - 1)) + (cacheHit ? 1 : 0);
      metrics.cacheHitRate = totalHits / totalCacheRequests;
    }
  }

  async getStoredFile(userId: string, path: string) {
    const start = performance.now();
    let success = false;
    let cacheHit = false;
    
    try {
      const store = this.stores.get('long') as BlobMemoryStore;
      if (!store || !('getFileByPath' in store)) {
        throw new Error('Long-term store does not support file retrieval');
      }

      const result = await store.getFileByPath(userId, path);
      success = !!result;
      cacheHit = result?.fromCache ?? false;

      this.updateFileMetrics(userId, {
        success,
        responseTime: performance.now() - start,
        size: result?.metadata?.size,
        cacheHit
      });

      return result;
    } catch (error) {
      success = false;
      this.updateFileMetrics(userId, {
        success,
        responseTime: performance.now() - start
      });
      throw error;
    }
  }

  async getFileMetrics(userId: string): Promise<FileOperationMetrics> {
    this.initializeMetrics(userId);
    return this.fileMetrics.get(userId)!;
  }

  async listUserFiles(userId: string) {
    const store = this.stores.get('long') as BlobMemoryStore;
    if (!store || !('listUserFiles' in store)) {
      throw new Error('Long-term store does not support file listing');
    }
    return store.listUserFiles(userId);
  }
} 