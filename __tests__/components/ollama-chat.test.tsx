import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from '@/components/custom/chat';
import { useModelSettings } from '@/lib/store/model-settings';

// Mock fetch
global.fetch = vi.fn();

function mockFetch(response: any) {
  return vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      body: {
        getReader: () => ({
          read: () =>
            Promise.resolve({
              done: true,
              value: new TextEncoder().encode(JSON.stringify(response)),
            }),
        }),
      },
    })
  );
}

// Mock the streaming response
const mockStream = {
  readable: new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('Test response'));
      controller.close();
    },
  }),
  writable: new WritableStream(),
};

// Mock TransformStream
global.TransformStream = vi.fn(() => mockStream);

describe('Ollama Chat Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset model settings to defaults
    useModelSettings.getState().resetSettings();
  });

  it('renders chat interface', () => {
    render(<Chat id="test-chat" />);
    expect(screen.getByPlaceholder('Send a message...')).toBeInTheDocument();
  });

  it('sends message to Ollama API', async () => {
    const mockResponse = {
      message: { content: 'Test response from Ollama' },
      done: true,
    };

    global.fetch = mockFetch(mockResponse);

    render(<Chat id="test-chat" />);
    
    const input = screen.getByPlaceholder('Send a message...');
    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Test message'),
        })
      );
    });
  });

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      })
    );

    render(<Chat id="test-chat" />);
    
    const input = screen.getByPlaceholder('Send a message...');
    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('uses model settings from store', async () => {
    const mockResponse = {
      message: { content: 'Test response' },
      done: true,
    };

    global.fetch = mockFetch(mockResponse);

    // Update model settings
    useModelSettings.getState().updateSettings({
      temperature: 0.8,
      topK: 50,
      topP: 0.95,
    });

    render(<Chat id="test-chat" />);
    
    const input = screen.getByPlaceholder('Send a message...');
    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          body: expect.stringContaining('"temperature":0.8'),
        })
      );
    });
  });

  it('handles streaming responses', async () => {
    const encoder = new TextEncoder();
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn()
            .mockResolvedValueOnce({
              done: false,
              value: encoder.encode(JSON.stringify({
                message: { content: 'Part 1' },
                done: false,
              }))
            })
            .mockResolvedValueOnce({
              done: false,
              value: encoder.encode(JSON.stringify({
                message: { content: 'Part 2' },
                done: true,
              }))
            })
            .mockResolvedValueOnce({
              done: true,
            }),
        }),
      },
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    render(<Chat id="test-chat" />);
    
    const input = screen.getByPlaceholder('Send a message...');
    await userEvent.type(input, 'Test streaming');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
}); 