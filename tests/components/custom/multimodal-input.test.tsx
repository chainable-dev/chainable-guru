import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultimodalInput } from '@/components/custom/multimodal-input';

describe('MultimodalInput Component', () => {
  const defaultProps = {
    chatId: 'test-chat',
    input: '',
    setInput: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
    stop: jest.fn(),
    attachments: [],
    setAttachments: jest.fn(),
    messages: [],
    setMessages: jest.fn(),
    append: jest.fn(),
    webSearchEnabled: true,
  };

  it('renders without crashing', () => {
    render(<MultimodalInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('Send a message...')).toBeInTheDocument();
  });

  it('calls setInput on input change', () => {
    render(<MultimodalInput {...defaultProps} />);
    const inputElement = screen.getByPlaceholderText('Send a message...');
    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    expect(defaultProps.setInput).toHaveBeenCalledWith('Hello');
  });

  it('displays attachments info when attachments are present', () => {
    const propsWithAttachments = {
      ...defaultProps,
      attachments: [{ name: 'file1.png' }],
    };
    render(<MultimodalInput {...propsWithAttachments} />);
    expect(screen.getByText('📎 1 attachment included')).toBeInTheDocument();
  });

  it('toggles web search mode', () => {
    render(<MultimodalInput {...defaultProps} />);
    const button = screen.getByRole('button', { name: /globe/i });
    fireEvent.click(button);
    expect(defaultProps.setInput).toHaveBeenCalledWith('Search: ');
  });
});
