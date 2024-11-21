export interface MemoryStats {
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  itemCount: number;
  cacheHitRate: number;
  averageResponseTime: number;
}

export interface MemoryStore {
  // Core operations
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  
  // Batch operations
  mset(entries: [string, any][], ttl?: number): Promise<void>;
  mget(keys: string[]): Promise<any[]>;
  
  // Pattern operations
  scan(pattern: string): Promise<string[]>;
  clear(pattern?: string): Promise<void>;
  
  // Monitoring
  getStats(): Promise<MemoryStats>;
  cleanup(): Promise<void>;
}

export type MemoryType = 'short' | 'long' | 'working';

export interface MemoryConfig {
  shortTerm: MemoryStore;
  longTerm: MemoryStore;
  working: MemoryStore;
} 