import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/ChatInterface';

global.fetch = jest.fn();

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ message: { content: 'AI response' } })
      })
    );
  });

  it('renders chat interface with search toggle', () => {
    render(<ChatInterface />);
    
    expect(screen.getByText('Enable Web Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('handles message submission', async () => {
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test message' }],
          enableSearch: false
        })
      });
    });
  });

  it('toggles search functionality', async () => {
    render(<ChatInterface />);
    
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test message' }],
          enableSearch: true
        })
      });
    });
  });
}); 