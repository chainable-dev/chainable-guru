import { describe, expect, it, vi } from 'vitest';
import { POST, DELETE } from '@/app/(chat)/api/chat/route';

// Basic mocks
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => ({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  }),
}));

vi.mock('@/db/cached-queries', () => ({
  getChatById: vi.fn(),
}));

vi.mock('@/db/mutations', () => ({
  deleteChatById: vi.fn(),
}));

describe('Chat API Routes', () => {
  describe('DELETE /api/chat', () => {
    it('should handle missing chat ID', async () => {
      const request = new Request('http://localhost:3000/api/chat');
      const response = await DELETE(request);
      expect(response.status).toBe(404);
    });

    it('should handle successful deletion', async () => {
      const request = new Request('http://localhost:3000/api/chat?id=test-id');
      
      const { getChatById } = await import('@/db/cached-queries');
      vi.mocked(getChatById).mockResolvedValueOnce({
        user_id: 'test-user-id',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
    });

    it('should handle unauthorized deletion', async () => {
      const request = new Request('http://localhost:3000/api/chat?id=test-id');
      
      const { getChatById } = await import('@/db/cached-queries');
      vi.mocked(getChatById).mockResolvedValueOnce({
        user_id: 'different-user-id',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(401);
    });
  });
}); 