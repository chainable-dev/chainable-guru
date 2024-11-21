import { put } from '@vercel/blob';
import { generateUUID } from '@/lib/utils';

export type TempAttachment = {
  id: string;
  url: string;
  name: string;
  contentType: string;
  tempPath?: string;
}

export type UploadResult = {
  success: boolean;
  url: string;
  path: string;
  contentType: string;
  name: string;
}

export class BlobStorage {
  private static tempAttachments = new Map<string, TempAttachment[]>();

  static async uploadFile(file: File, userId: string): Promise<UploadResult> {
    try {
      const blobPath = `${userId}/${generateUUID()}/${file.name}`;
      
      const blob = await put(blobPath, file, {
        access: 'public',
        addRandomSuffix: true,
      });

      return {
        success: true,
        url: blob.url,
        path: blob.url,
        contentType: file.type,
        name: file.name
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      throw new Error('Failed to upload file to blob storage');
    }
  }

  static addTempAttachment(sessionId: string, attachment: TempAttachment) {
    const existing = this.tempAttachments.get(sessionId) || [];
    this.tempAttachments.set(sessionId, [...existing, attachment]);
  }

  static getTempAttachments(sessionId: string): TempAttachment[] {
    return this.tempAttachments.get(sessionId) || [];
  }

  static clearTempAttachments(sessionId: string) {
    this.tempAttachments.delete(sessionId);
  }
} 