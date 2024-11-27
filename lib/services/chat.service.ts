import { Message, StreamingTextResponse } from 'ai';
import { OpenAI } from 'openai';
import { openai } from '../openai/config';

// Chat service error types
export class ChatServiceError extends Error {
  constructor(message: string) {
    super(`Chat Service Error: ${message}`);
  }
}

// Chat service types
export interface ChatOptions {
  messages: Message[];
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
}

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  async streamChat({
    messages,
    modelId = 'gpt-4',
    temperature = 0.7,
    maxTokens = 1000,
  }: ChatOptions): Promise<any> {
    try {
      const response = await openai.chat.completions.create({
        model: modelId,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });

      return response;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw new ChatServiceError(error.message);
      }
      throw new ChatServiceError('Unknown error occurred during chat streaming');
    }
  }

  async generateTitle(message: Message): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title for this message. Keep it under 80 characters.',
          },
          {
            role: 'user',
            content: message.content,
          },
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      return completion.choices[0]?.message?.content || 'New Chat';
    } catch (error) {
      console.error('Title Generation Error:', error);
      if (error instanceof Error) {
        throw new ChatServiceError(error.message);
      }
      throw new ChatServiceError('Failed to generate title');
    }
  }
}

// Export singleton instance
export const chatService = ChatService.getInstance(); 