import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import { ChatMessage } from '@/components/Chat/ChatMessage';

describe('ChatMessage Component', () => {
  it('should render user message correctly', () => {
    render(
      <ChatMessage
        message={{
          role: 'user',
          content: 'Hello world',
          id: '1',
        }}
      />
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('should render assistant message with markdown', () => {
    render(
      <ChatMessage
        message={{
          role: 'assistant',
          content: '```js\nconsole.log("hello")\n```',
          id: '2',
        }}
      />
    );

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
  });
}); 