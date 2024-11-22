import { Session } from '@supabase/supabase-js';
import { put, del, list } from '@vercel/blob';
import { MemoryStore, MemoryStats, SessionMemory, UserPreferences } from '@/types';

export class BlobMemoryStore implements MemoryStore {
  private metrics = {
    totalResponseTime: 0,
    requestCount: 0
  };
  private currentSession: Session | null;

  constructor(
    private readonly prefix: string,
    private readonly blobToken: string,
    currentSession: Session | null,
    private readonly compressionThreshold: number = 1024,
    private readonly maxSize: number = 10 * 1024 * 1024
  ) {
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
      cacheHitRate: 0,
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
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    const blobKey = `${this.prefix}/${key}`;
    const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
    
    await put(blobKey, blob, { 
      access: 'public',
      addRandomSuffix: false,
      contentType: JSON.stringify({
        timestamp: Date.now(),
        ttl
      })
    });
  }

  async get(key: string): Promise<any> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    const blobKey = `${this.prefix}/${key}`;
    try {
      const response = await fetch(blobKey);
      if (!response.ok) return null;
      const data = await response.json();
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
    const { blobs } = await list({ prefix: this.prefix });
    const blobsToDelete = pattern ? 
      blobs.filter((blob: any) => blob.pathname.includes(pattern)) :
      blobs;
    await Promise.all(blobsToDelete.map((blob: any) => del(blob.url)));
  }

  async delete(key: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('User is not authenticated');
    }

    const { blobs } = await list({ prefix: `${this.prefix}/${key}` });
    await Promise.all(blobs.map((blob: any) => del(blob.url)));
  }
}
