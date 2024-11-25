type Role = 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';

interface ChatMessage {
  id?: string;
  role: Role;
  content: string;
  createdAt?: Date;
}

export const TOKEN_LIMITS = {
  'gpt-4': 8192,
  'gpt-4-32k': 32768,
  'gpt-3.5-turbo': 4096,
  'gpt-3.5-turbo-16k': 16384,
  'claude-2': 100000,
  'claude-instant-1': 100000,
  'DEFAULT_MAX_TOKENS': 4096
} as const;

// Rough estimation of tokens based on characters
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const optimizeMessages = (
  messages: ChatMessage[],
  modelId: string,
  maxTokens: number = TOKEN_LIMITS.DEFAULT_MAX_TOKENS
): ChatMessage[] => {
  let totalTokens = 0;
  const optimizedMessages: ChatMessage[] = [];

  // Process messages in reverse order (newest first)
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const estimatedTokens = estimateTokens(message.content);
    
    // Always include the most recent message pair (user question and AI response)
    if (i >= messages.length - 2) {
      optimizedMessages.unshift(message);
      totalTokens += estimatedTokens;
      continue;
    }

    // Check if adding this message would exceed the token limit
    if (totalTokens + estimatedTokens < maxTokens) {
      optimizedMessages.unshift(message);
      totalTokens += estimatedTokens;
    } else {
      // If we can't add more messages, break the loop
      break;
    }
  }

  return optimizedMessages;
}; 