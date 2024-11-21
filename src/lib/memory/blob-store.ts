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

interface FileMetadata extends BlobMetadata {
  filename: string;
  contentType: string;
  size: number;
}

interface ImageMetadata extends FileMetadata {
  width?: number;
  height?: number;
  format?: string;
  thumbnailUrl?: string;
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

  async uploadFile(file: File, chatId: string): Promise<string> {
    try {
      const fileKey = `${this.prefix}/files/${chatId}/${file.name}`;
      const metadata: FileMetadata = {
        filename: file.name,
        contentType: file.type,
        size: file.size,
        timestamp: Date.now(),
        compressed: false
      };

      // Upload file to blob storage
      const { url } = await put(fileKey, file, {
        access: 'public',
        addRandomSuffix: true,
        metadata: metadata as Record<string, unknown>
      });

      // Cache file metadata
      this.cache.set(fileKey, {
        url,
        metadata
      });

      return url;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async getFile(chatId: string, filename: string): Promise<{ url: string; metadata: FileMetadata } | null> {
    try {
      const fileKey = `${this.prefix}/files/${chatId}/${filename}`;
      
      // Check cache first
      const cached = this.cache.get(fileKey);
      if (cached) return cached;

      const { blobs } = await list({
        prefix: fileKey
      });

      if (!blobs.length) return null;

      const blob = blobs[0];
      const metadata = blob.metadata as FileMetadata;

      const result = {
        url: blob.url,
        metadata
      };

      // Update cache
      this.cache.set(fileKey, result);

      return result;
    } catch (error) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  async listFiles(chatId: string): Promise<Array<{ url: string; metadata: FileMetadata }>> {
    try {
      const { blobs } = await list({
        prefix: `${this.prefix}/files/${chatId}`
      });

      return blobs.map(blob => ({
        url: blob.url,
        metadata: blob.metadata as FileMetadata
      }));
    } catch (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  async deleteFile(chatId: string, filename: string): Promise<void> {
    try {
      const fileKey = `${this.prefix}/files/${chatId}/${filename}`;
      const { blobs } = await list({
        prefix: fileKey
      });

      await Promise.all(blobs.map(blob => del(blob.url)));
      this.cache.delete(fileKey);
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async uploadImage(
    image: File | Blob,
    chatId: string,
    options?: {
      generateThumbnail?: boolean;
      maxWidth?: number;
      maxHeight?: number;
    }
  ): Promise<{ url: string; metadata: ImageMetadata }> {
    try {
      // Get image dimensions
      const imageBitmap = await createImageBitmap(image);
      const { width, height } = imageBitmap;

      const fileKey = `${this.prefix}/images/${chatId}/${Date.now()}-${width}x${height}.${this.getImageFormat(image)}`;
      
      const metadata: ImageMetadata = {
        filename: image instanceof File ? image.name : fileKey.split('/').pop()!,
        contentType: image.type,
        size: image.size,
        timestamp: Date.now(),
        compressed: false,
        width,
        height,
        format: this.getImageFormat(image)
      };

      // Generate thumbnail if requested
      if (options?.generateThumbnail) {
        const thumbnailBlob = await this.generateThumbnail(image, {
          maxWidth: options.maxWidth || 200,
          maxHeight: options.maxHeight || 200
        });
        
        const thumbnailKey = `${this.prefix}/images/${chatId}/thumbnails/${metadata.filename}`;
        const { url: thumbnailUrl } = await put(thumbnailKey, thumbnailBlob, {
          access: 'public',
          addRandomSuffix: true
        });
        
        metadata.thumbnailUrl = thumbnailUrl;
      }

      // Upload original image
      const { url } = await put(fileKey, image, {
        access: 'public',
        addRandomSuffix: true,
        metadata: metadata as Record<string, unknown>
      });

      // Cache image metadata
      this.cache.set(fileKey, {
        url,
        metadata
      });

      return { url, metadata };
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  private getImageFormat(image: File | Blob): string {
    const type = image.type;
    return type.split('/')[1] || 'unknown';
  }

  private async generateThumbnail(
    image: File | Blob,
    { maxWidth, maxHeight }: { maxWidth: number; maxHeight: number }
  ): Promise<Blob> {
    const img = await createImageBitmap(image);
    const canvas = new OffscreenCanvas(maxWidth, maxHeight);
    const ctx = canvas.getContext('2d')!;

    // Calculate thumbnail dimensions
    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    const width = img.width * ratio;
    const height = img.height * ratio;

    // Draw resized image
    ctx.drawImage(img, 0, 0, width, height);
    
    return canvas.convertToBlob({
      type: 'image/jpeg',
      quality: 0.8
    });
  }

  async getImage(chatId: string, imageId: string): Promise<{ url: string; metadata: ImageMetadata } | null> {
    try {
      const imageKey = `${this.prefix}/images/${chatId}/${imageId}`;
      
      // Check cache first
      const cached = this.cache.get(imageKey);
      if (cached) return cached;

      const { blobs } = await list({
        prefix: imageKey
      });

      if (!blobs.length) return null;

      const blob = blobs[0];
      const metadata = blob.metadata as ImageMetadata;

      const result = {
        url: blob.url,
        metadata
      };

      // Update cache
      this.cache.set(imageKey, result);

      return result;
    } catch (error) {
      throw new Error(`Failed to get image: ${error.message}`);
    }
  }

  async listImages(chatId: string): Promise<Array<{ url: string; metadata: ImageMetadata }>> {
    try {
      const { blobs } = await list({
        prefix: `${this.prefix}/images/${chatId}`
      });

      // Filter out thumbnails
      return blobs
        .filter(blob => !blob.pathname.includes('/thumbnails/'))
        .map(blob => ({
          url: blob.url,
          metadata: blob.metadata as ImageMetadata
        }));
    } catch (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
  }

  async deleteImage(chatId: string, imageId: string): Promise<void> {
    try {
      const imageKey = `${this.prefix}/images/${chatId}/${imageId}`;
      const { blobs } = await list({
        prefix: imageKey
      });

      // Delete original and thumbnail
      await Promise.all(blobs.map(async blob => {
        const metadata = blob.metadata as ImageMetadata;
        await del(blob.url);
        if (metadata.thumbnailUrl) {
          await del(metadata.thumbnailUrl);
        }
      }));

      this.cache.delete(imageKey);
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async getFileByPath(userId: string, path: string) {
    const fileKey = `documents/${userId}/${path}`;
    
    // Check cache first
    const cached = this.cache.get(fileKey);
    if (cached) return cached;

    const { blobs } = await list({
      prefix: fileKey
    });

    if (!blobs.length) return null;

    const blob = blobs[0];
    const result = {
      url: blob.url,
      metadata: blob.metadata
    };

    // Update cache
    this.cache.set(fileKey, result);

    return result;
  }

  async listUserFiles(userId: string) {
    const { blobs } = await list({
      prefix: `documents/${userId}`
    });

    return blobs.map(blob => ({
      path: blob.pathname,
      url: blob.url,
      metadata: blob.metadata
    }));
  }
} 