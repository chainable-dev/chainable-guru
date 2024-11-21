import { MemoryStore, MemoryType, MemoryConfig, FileMetadata } from '@/types';

import { BlobMemoryStore } from './blob-store';

export class MemoryManager {
  private stores: Map<MemoryType, MemoryStore> = new Map();

  constructor(config: MemoryConfig) {
    this.stores.set('short', config.shortTerm);
    this.stores.set('long', config.longTerm);
    this.stores.set('working', config.working);
  }

  private getStore(type: MemoryType): MemoryStore {
    const store = this.stores.get(type);
    if (!store) throw new Error(`Invalid memory type: ${type}`);
    return store;
  }

  async uploadFile(file: File, userId: string): Promise<string> {
    const store = this.getStore('long');
    if (!store.uploadFile) {
      throw new Error('Store does not support file uploads');
    }
    return store.uploadFile(file, userId);
  }

  async getFile(userId: string, fileId: string) {
    const store = this.getStore('long');
    if (!store.getFile) {
      throw new Error('Store does not support file retrieval');
    }
    return store.getFile(userId, fileId);
  }

  async listFiles(userId: string) {
    const store = this.getStore('long');
    if (!store.listFiles) {
      throw new Error('Store does not support file listing');
    }
    return store.listFiles(userId);
  }

  async deleteFile(userId: string, fileId: string) {
    const store = this.getStore('long');
    if (!store.deleteFile) {
      throw new Error('Store does not support file deletion');
    }
    return store.deleteFile(userId, fileId);
  }
} 