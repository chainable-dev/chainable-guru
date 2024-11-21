import { describe, it, expect, vi } from 'vitest';
import { BlobStorage } from '@/lib/blob-storage';

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://example.com/test.jpg' })
}));

describe('BlobStorage', () => {
  it('generates correct storage paths', () => {
    const storagePath = 'documents/user123/test.jpg';
    const fullUrl = BlobStorage.getFullUrl(storagePath);
    expect(fullUrl).toBe('https://febf1j2hfwrzghcn.public.blob.vercel-storage.com/documents/user123/test.jpg');
  });

  it('uploads files with correct path structure', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const userId = 'user123';
    const token = 'test-token';

    const result = await BlobStorage.upload(file, userId, token);
    
    expect(result.storagePath).toMatch(/^documents\/user123\/[\w-]+\.jpg$/);
    expect(result.url).toBe('https://example.com/test.jpg');
  });
}); 