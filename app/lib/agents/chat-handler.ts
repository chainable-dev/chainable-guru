import { Message } from 'ai';
import { initializeAgent } from './config';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export class ChatHandler {
  private static instance: ChatHandler;
  private agent: any;
  private isProcessing: boolean = false;

  private constructor() {}

  public static async getInstance(): Promise<ChatHandler> {
    if (!ChatHandler.instance) {
      ChatHandler.instance = new ChatHandler();
      ChatHandler.instance.agent = await initializeAgent();
    }
    return ChatHandler.instance;
  }

  public async processMessage(
    message: string,
    onProgress?: (intermediateResponse: string) => void
  ): Promise<Message> {
    if (this.isProcessing) {
      throw new Error('Another message is being processed');
    }

    this.isProcessing = true;
    try {
      const response = await this.agent.call(
        {
          input: message,
        },
        {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                onProgress?.(token);
              },
            },
          ],
        }
      );

      this.isProcessing = false;
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.output,
      };
    } catch (error) {
      this.isProcessing = false;
      throw error;
    }
  }

  public async getMessageHistory(): Promise<Message[]> {
    const memory = await this.agent.memory.loadMemoryVariables({});
    return memory.chat_history.map((msg: HumanMessage | AIMessage) => ({
      id: Date.now().toString(),
      role: msg._getType() === 'human' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }
} 