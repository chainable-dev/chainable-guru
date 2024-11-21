import { Session } from '@supabase/supabase-js';
import { put, del, list } from '@vercel/blob';
import * as LRUCache from 'lru-cache';

import { MemoryStore, MemoryStats, FileMetadata, SessionMemory, UserPreferences } from '@/types';


interface CacheOptions {
  max: number;
  maxAge?: number;
}

export class BlobMemoryStore implements MemoryStore {
  private cache: LRUCache.LRUCache<string, any>;
  private metrics = {
    totalResponseTime: 0,
    requestCount: 0,
    cacheItems: 0
  };
  private currentSession: Session | null;

  constructor(
    private readonly prefix: string,
    private readonly blobToken: string,
    currentSession: Session | null,
    private readonly compressionThreshold: number = 1024,
    private readonly maxSize: number = 10 * 1024 * 1024,
    cacheOptions: CacheOptions = { max: 100, maxAge: 300000 }
  ) {
    this.cache = new LRUCache.LRUCache({
      max: cacheOptions.max,
      ttl: cacheOptions.maxAge
    });
    this.currentSession = currentSession;
  }

  async setSession(id: string, memory: SessionMemory): Promise<void> {
    await this.set(id, memory);
  }

  async getSession(id: string): Promise<SessionMemory | null> {
    return this.get(id);
  }

  async setUserPrefs(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }
    await this.set(`userPrefs:${userId}`, prefs);
  }

  async getUserPrefs(): Promise<UserPreferences | null> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }
    return this.get('userPrefs');
  }

  private getCacheSize(): number {
    return Array.from(this.cache.keys()).length;
  }

  async getStats(): Promise<MemoryStats> {
    const { blobs } = await list({ prefix: this.prefix });

    let totalSize = 0;
    let compressedSize = 0;

    blobs.forEach((blob: any) => {
      const meta = blob as unknown as { metadata: { size?: number; compressedSize?: number } };
      if (meta?.metadata?.size) totalSize += meta.metadata.size;
      if (meta?.metadata?.compressedSize) compressedSize += meta.metadata.compressedSize;
    });

    return {
      totalSize,
      compressedSize,
      compressionRatio: totalSize ? totalSize / compressedSize : 1,
      itemCount: blobs.length,
      cacheHitRate: this.metrics.requestCount ?
        (this.getCacheSize() / this.metrics.requestCount) * 100 : 0,
      averageResponseTime: this.metrics.requestCount ?
        this.metrics.totalResponseTime / this.metrics.requestCount : 0
    };
  }

  async cleanup(): Promise<void> {
    const { blobs } = await list({ prefix: this.prefix });
    const now = Date.now();

    const expired = blobs.filter((blob: any) => {
      const meta = blob as unknown as { metadata: { timestamp?: number; ttl?: number } };
      return meta?.metadata?.ttl && meta?.metadata?.timestamp &&
             (now - meta.metadata.timestamp > meta.metadata.ttl);
    });

    await Promise.all(expired.map((blob: any) => del(blob.url)));
    this.cache.clear();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    this.cache.set(key, value, { ttl });

    const blobKey = `${this.prefix}/${key}`;
    const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
    await put(blobKey, blob, { access: 'public' });
  }

  async get(key: string): Promise<any> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    const cachedValue = this.cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const blobKey = `${this.prefix}/${key}`;
    try {
      const response = await fetch(blobKey);
      if (!response.ok) return null;
      const data = await response.json();
      this.cache.set(key, data);
      return data;
    } catch (error) {
      return null;
    }
  }

  async mset(entries: [string, any][], ttl?: number): Promise<void> {
    await Promise.all(entries.map(([key, value]) => this.set(key, value, ttl)));
  }

  async mget(keys: string[]): Promise<any[]> {
    return Promise.all(keys.map(key => this.get(key)));
  }

  async scan(pattern: string): Promise<string[]> {
    const { blobs } = await list({ prefix: this.prefix });
    return blobs
      .map((blob: any) => blob.pathname)
      .filter((path: string) => path.includes(pattern));
  }

  async clear(pattern?: string): Promise<void> {
    if (pattern) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key: string) => key.includes(pattern));
      keysToDelete.forEach((key: string) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }

    const { blobs } = await list({ prefix: this.prefix });
    const blobsToDelete = blobs.filter((blob: any) => blob.pathname.includes(pattern || ''));
    await Promise.all(blobsToDelete.map((blob: any) => del(blob.url)));
  }

  async delete(key: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    this.cache.delete(key);
    const { blobs } = await list({ prefix: `${this.prefix}/${key}` });
    await Promise.all(blobs.map((blob: any) => del(blob.url)));
  }
}
