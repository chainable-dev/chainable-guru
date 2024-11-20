import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test-utils';
import ChatLayout from '@/app/(chat)/layout';
import { createClient } from '@/lib/supabase/server';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

describe('Chat Layout', () => {
  it('should render chat interface components', () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } })
      }
    };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    render(
      <ChatLayout>
        <div data-testid="chat-content">Chat Content</div>
      </ChatLayout>
    );

    expect(screen.getByTestId('chat-content')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should handle authentication state', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { 
            user: { 
              id: '123', 
              email: 'test@example.com' 
            } 
          }
        })
      }
    };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);

    render(
      <ChatLayout>
        <div>Protected Content</div>
      </ChatLayout>
    );

    // Verify auth-dependent elements are rendered
    expect(await screen.findByTestId('user-nav')).toBeInTheDocument();
  });
}); 