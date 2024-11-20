import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';
import { auth } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle POST request with valid input', async () => {
    // Mock authentication
    vi.mocked(auth).mockResolvedValue({
      userId: '123',
      user: { email: 'test@example.com' }
    });

    // Mock Supabase client
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        previewToken: null
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('messages');
    expect(mockSupabase.from).toHaveBeenCalledWith('conversations');
  });

  it('should handle unauthorized requests', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);
  });

  it('should handle invalid input', async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: '123',
      user: { email: 'test@example.com' }
    });

    const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should handle database errors', async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: '123',
      user: { email: 'test@example.com' }
    });

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      })
    };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }]
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(500);
  });
}); 