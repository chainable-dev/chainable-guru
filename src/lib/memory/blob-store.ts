import { put, del, list } from '@vercel/blob';
import { MemoryStore } from './types';
import { compress, decompress } from '@/lib/utils/compression';
import LRU from 'lru-cache';

interface BlobMetadata {
  ttl?: number;
  timestamp: number;
  compressed: boolean;
  originalSize?: number;
  compressedSize?: number;
  hash?: string;
}

export class BlobMemoryStore implements MemoryStore {
  private cache: LRU<string, any>;
  
  constructor(
    private readonly prefix: string,
    private readonly blobToken: string,
    private readonly compressionThreshold: number = 1024, // 1KB
    private readonly maxSize: number = 10 * 1024 * 1024, // 10MB
    private readonly cacheSize: number = 100 // Number of items to cache
  ) {
    this.cache = new LRU({
      max: cacheSize,
      ttl: 1000 * 60 * 5 // 5 minutes default TTL
    });
  }

  private generateHash(data: string): string {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
      .then(hash => Buffer.from(hash).toString('hex'));
  }

  private async shouldCompress(data: string): Promise<boolean> {
    return data.length > this.compressionThreshold;
  }

  private async validateSize(data: string): Promise<void> {
    if (data.length > this.maxSize) {
      throw new Error(`Data size exceeds maximum allowed size of ${this.maxSize} bytes`);
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringData = JSON.stringify(value);
      await this.validateSize(stringData);

      const hash = await this.generateHash(stringData);
      let blobData: Blob;
      let metadata: BlobMetadata = {
        ttl,
        timestamp: Date.now(),
        compressed: false,
        originalSize: stringData.length,
        hash
      };

      if (await this.shouldCompress(stringData)) {
        const compressed = await compress(stringData);
        metadata.compressed = true;
        metadata.compressedSize = compressed.length;
        blobData = new Blob([compressed], { type: 'application/octet-stream' });
      } else {
        blobData = new Blob([stringData], { type: 'application/json' });
      }

      const blobKey = `${this.prefix}/${key}.json`;
      await put(blobKey, blobData, {
        access: 'public',
        addRandomSuffix: true,
        metadata: metadata as Record<string, unknown>
      });

      // Update cache
      this.cache.set(key, {
        value,
        metadata
      }, { ttl: ttl || this.cache.ttl });

    } catch (error) {
      throw new Error(`Failed to store blob: ${error.message}`);
    }
  }

  async get(key: string): Promise<any> {
    try {
      // Check cache first
      const cached = this.cache.get(key);
      if (cached) {
        const { value, metadata } = cached;
        if (!metadata.ttl || Date.now() - metadata.timestamp <= metadata.ttl) {
          return value;
        }
        this.cache.delete(key);
      }

      const { blobs } = await list({
        prefix: `${this.prefix}/${key}`
      });
      
      if (!blobs.length) return null;
      
      const blob = blobs[0];
      const metadata = blob.metadata as BlobMetadata;
      
      // Check TTL
      if (metadata.ttl && Date.now() - metadata.timestamp > metadata.ttl) {
        await this.delete(key);
        return null;
      }

      const response = await fetch(blob.url);
      const data = await response.text();

      let result;
      if (metadata.compressed) {
        const decompressed = await decompress(data);
        result = JSON.parse(decompressed);
      } else {
        result = JSON.parse(data);
      }

      // Validate hash if available
      if (metadata.hash) {
        const currentHash = await this.generateHash(JSON.stringify(result));
        if (currentHash !== metadata.hash) {
          throw new Error('Data integrity check failed');
        }
      }

      // Update cache
      this.cache.set(key, {
        value: result,
        metadata
      }, { ttl: metadata.ttl });

      return result;
    } catch (error) {
      throw new Error(`Failed to retrieve blob: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { blobs } = await list({
        prefix: `${this.prefix}/${key}`
      });
      
      await Promise.all(blobs.map(blob => del(blob.url)));
    } catch (error) {
      throw new Error(`Failed to delete blob: ${error.message}`);
    }
  }

  async mset(entries: [string, any][], ttl?: number): Promise<void> {
    await Promise.all(
      entries.map(([key, value]) => this.set(key, value, ttl))
    );
  }

  async mget(keys: string[]): Promise<any[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async scan(pattern: string): Promise<string[]> {
    try {
      const { blobs } = await list({
        prefix: this.prefix
      });
      
      return blobs
        .map(blob => blob.pathname)
        .filter(path => path.includes(pattern));
    } catch (error) {
      throw new Error(`Failed to scan blobs: ${error.message}`);
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      const { blobs } = await list({
        prefix: this.prefix
      });
      
      const toDelete = pattern
        ? blobs.filter(blob => blob.pathname.includes(pattern))
        : blobs;
        
      await Promise.all(toDelete.map(blob => del(blob.url)));
    } catch (error) {
      throw new Error(`Failed to clear blobs: ${error.message}`);
    }
  }

  // Utility methods
  async getStats(): Promise<{
    totalSize: number;
    compressedSize: number;
    compressionRatio: number;
    itemCount: number;
    cacheHitRate: number;
    averageResponseTime: number;
  }> {
    const { blobs } = await list({ prefix: this.prefix });
    
    let totalSize = 0;
    let compressedSize = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let totalResponseTime = 0;
    let responseCount = 0;
    
    blobs.forEach(blob => {
      const metadata = blob.metadata as BlobMetadata;
      if (metadata.originalSize) totalSize += metadata.originalSize;
      if (metadata.compressedSize) compressedSize += metadata.compressedSize;
    });

    return {
      totalSize,
      compressedSize,
      compressionRatio: totalSize ? totalSize / compressedSize : 1,
      itemCount: blobs.length,
      cacheHitRate: (cacheHits / (cacheHits + cacheMisses)) * 100 || 0,
      averageResponseTime: responseCount ? totalResponseTime / responseCount : 0
    };
  }

  // Maintenance methods
  async cleanup(): Promise<void> {
    try {
      const { blobs } = await list({ prefix: this.prefix });
      const now = Date.now();
      
      const expired = blobs.filter(blob => {
        const metadata = blob.metadata as BlobMetadata;
        return metadata.ttl && now - metadata.timestamp > metadata.ttl;
      });
      
      await Promise.all(expired.map(blob => del(blob.url)));
      
      // Clear expired cache entries
      this.cache.purgeStale();
    } catch (error) {
      throw new Error(`Cleanup failed: ${error.message}`);
    }
  }
} 