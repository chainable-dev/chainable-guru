export type TempAttachment = {
  id: string;
  url: string;
  name: string;
  contentType: string;
  tempPath?: string;
}

export class BlobStorage {
  private static tempAttachments = new Map<string, TempAttachment[]>();

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