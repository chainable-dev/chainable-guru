import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export interface TempAttachment {
  id: string;
  url: string;
  name: string;
  contentType: string;
  tempPath?: string;
}

export class BlobService {
  private static tempAttachments = new Map<string, TempAttachment[]>();

  // Temporary attachment management
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

  // Vercel Blob storage
  static async uploadToBlob(file: File): Promise<TempAttachment> {
    try {
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase();
      const filename = `${nanoid()}-${safeFileName}`;

      const { url } = await put(filename, file, {
        access: "public",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      const attachment: TempAttachment = {
        id: nanoid(),
        url,
        name: file.name,
        contentType: file.type,
        tempPath: filename,
      };

      return attachment;
    } catch (error) {
      console.error("Error uploading to blob:", error);
      throw error;
    }
  }

  // Combined upload and temp storage
  static async uploadAndStore(sessionId: string, file: File): Promise<TempAttachment> {
    const attachment = await this.uploadToBlob(file);
    this.addTempAttachment(sessionId, attachment);
    return attachment;
  }
} 