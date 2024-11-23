import { render, fireEvent, screen } from '@testing-library/react';
import { MultimodalInput } from '../multimodal-input';
import { vi } from 'vitest';

describe('MultimodalInput', () => {
  const defaultProps = {
    input: '',
    setInput: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
    attachments: [],
    setAttachments: vi.fn(),
    messages: [],
    setMessages: vi.fn(),
    append: vi.fn(),
    handleSubmit: vi.fn(),
    chatId: 'test-chat',
  };

  it('should render without crashing', () => {
    render(<MultimodalInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Send a message...')).toBeInTheDocument();
  });

  it('should call setInput on input change', () => {
    render(<MultimodalInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(defaultProps.setInput).toHaveBeenCalledWith('Hello');
  });

  it('should prevent duplicate file uploads', () => {
    render(<MultimodalInput {...defaultProps} />);
    const fileInput = screen.getByLabelText(/upload/i);
    const file = new File(['content'], 'test.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file, file] } });

    // Check that the file is only added once
    expect(defaultProps.setAttachments).toHaveBeenCalledTimes(1);
  });

  it('should remove staged file immediately after upload', async () => {
    // Similar setup as above
    // Add logic to simulate file upload and check staged file removal
  });
});
