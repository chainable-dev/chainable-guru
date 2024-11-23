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

  it('toggles web search mode correctly', () => {
    render(<MultimodalInput {...defaultProps} />);
    const button = screen.getByRole('button', { name: /globe/i });
    fireEvent.click(button);
    expect(defaultProps.setInput).toHaveBeenCalledWith('Search: ');
    fireEvent.click(button);
    expect(defaultProps.setInput).toHaveBeenCalledWith('');
  });

  it('handles file upload correctly', () => {
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    render(<MultimodalInput {...defaultProps} />);
    const input = screen.getByLabelText('Upload file');
    fireEvent.change(input, { target: { files: [file] } });
    expect(defaultProps.setAttachments).toHaveBeenCalledWith([file]);
  });

  it('displays correct placeholder in web search mode', () => {
    render(<MultimodalInput {...defaultProps} />);
    const button = screen.getByRole('button', { name: /globe/i });
    fireEvent.click(button);
    const inputElement = screen.getByPlaceholderText('Enter your search query...');
    expect(inputElement).toBeInTheDocument();
  });

  it('displays correct placeholder in chat mode', () => {
    render(<MultimodalInput {...defaultProps} />);
    const inputElement = screen.getByPlaceholderText('Send a message...');
    expect(inputElement).toBeInTheDocument();
  });
it('toggles web search mode correctly', () => {
  render(<MultimodalInput {...defaultProps} />);
  const button = screen.getByRole('button', { name: /globe/i });
  fireEvent.click(button);
  expect(defaultProps.setInput).toHaveBeenCalledWith('Search: ');
  fireEvent.click(button);
  expect(defaultProps.setInput).toHaveBeenCalledWith('');
});

it('handles file upload correctly', () => {
  const file = new File(['hello'], 'hello.png', { type: 'image/png' });
  render(<MultimodalInput {...defaultProps} />);
  const input = screen.getByLabelText('Upload file');
  fireEvent.change(input, { target: { files: [file] } });
  expect(defaultProps.setAttachments).toHaveBeenCalledWith([file]);
});
