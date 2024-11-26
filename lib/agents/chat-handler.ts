import { Message } from 'ai';
import { initializeAgent } from './config';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_TOKENS_PER_MESSAGE = 4000;
const MAX_CONSECUTIVE_ERRORS = 3;
const MAX_PROCESSING_TIME = 30000; // 30 seconds

export class ChatHandler {
  private static instance: ChatHandler;
  private agent: any;
  private isProcessing: boolean = false;
  private lastProcessingTime: number = 0;
  private consecutiveErrors: number = 0;
  private processingTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    console.log('ChatHandler: Initializing new instance');
  }

  public static async getInstance(): Promise<ChatHandler> {
    console.log('ChatHandler: Getting instance');
    if (!ChatHandler.instance) {
      console.log('ChatHandler: Creating new instance');
      ChatHandler.instance = new ChatHandler();
      console.log('ChatHandler: Initializing agent');
      ChatHandler.instance.agent = await initializeAgent();
      console.log('ChatHandler: Agent initialized successfully');
    }
    return ChatHandler.instance;
  }

  private resetState() {
    console.log('ChatHandler: Resetting state');
    this.isProcessing = false;
    this.consecutiveErrors = 0;
    if (this.processingTimeout) {
      console.log('ChatHandler: Clearing processing timeout');
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessingTime;
    
    if (timeSinceLastProcess < RATE_LIMIT_WINDOW) {
      console.log(`ChatHandler: Rate limiting - waiting ${RATE_LIMIT_WINDOW - timeSinceLastProcess}ms`);
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_WINDOW - timeSinceLastProcess)
      );
    }
    this.lastProcessingTime = Date.now();
    console.log('ChatHandler: Rate limit check complete');
  }

  public async processMessage(
    message: string,
    onProgress?: (intermediateResponse: string) => void,
    retryCount: number = 0
  ): Promise<Message> {
    console.log(`ChatHandler: Processing message (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    console.log('ChatHandler: Message content:', message.slice(0, 100) + '...');

    // Check if already processing
    if (this.isProcessing) {
      console.log('ChatHandler: Already processing a message');
      throw new Error('Another message is being processed');
    }

    // Check consecutive errors
    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      console.log(`ChatHandler: Too many consecutive errors (${this.consecutiveErrors})`);
      throw new Error('Too many consecutive errors. Please try again later.');
    }

    // Enforce rate limiting
    await this.enforceRateLimit();

    this.isProcessing = true;
    console.log('ChatHandler: Starting message processing');

    // Set processing timeout
    this.processingTimeout = setTimeout(() => {
      console.log('ChatHandler: Processing timeout exceeded');
      this.resetState();
      throw new Error('Processing timeout exceeded');
    }, MAX_PROCESSING_TIME);

    try {
      console.log('ChatHandler: Calling agent');
      const response = await this.agent.call(
        {
          input: message,
        },
        {
          callbacks: [
            {
              handleLLMNewToken(token: string) {
                console.log('ChatHandler: New token received:', token);
                onProgress?.(token);
              },
              handleLLMError(error: Error) {
                console.error('ChatHandler: LLM Error:', error);
              },
              handleLLMEnd() {
                console.log('ChatHandler: LLM processing completed');
              },
            },
          ],
        }
      );

      console.log('ChatHandler: Agent response received:', response);

      // Reset error count on success
      this.consecutiveErrors = 0;
      this.resetState();

      console.log('ChatHandler: Processing completed successfully');
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.output,
      };
    } catch (error) {
      console.error('ChatHandler: Error during processing:', error);
      this.consecutiveErrors++;
      console.log(`ChatHandler: Consecutive errors: ${this.consecutiveErrors}`);

      // Retry logic for recoverable errors
      if (retryCount < MAX_RETRIES && this.isRecoverableError(error)) {
        console.log('ChatHandler: Attempting retry');
        this.resetState();
        return this.processMessage(message, onProgress, retryCount + 1);
      }

      console.log('ChatHandler: Error is not recoverable or max retries exceeded');
      this.resetState();
      throw error;
    }
  }

  private isRecoverableError(error: any): boolean {
    console.log('ChatHandler: Checking if error is recoverable:', error.message);
    const recoverableErrors = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ECONNREFUSED',
      'socket hang up',
      'network error',
      'rate limit',
      'timeout'
    ];

    const isRecoverable = recoverableErrors.some(errType => 
      error.message?.toLowerCase().includes(errType.toLowerCase())
    );
    console.log('ChatHandler: Error is recoverable:', isRecoverable);
    return isRecoverable;
  }

  public async getMessageHistory(): Promise<Message[]> {
    console.log('ChatHandler: Getting message history');
    try {
      const memory = await this.agent.memory.loadMemoryVariables({});
      console.log('ChatHandler: Message history loaded:', memory);
      return memory.chat_history.map((msg: HumanMessage | AIMessage) => ({
        id: Date.now().toString(),
        role: msg._getType() === 'human' ? 'user' : 'assistant',
        content: msg.content,
      }));
    } catch (error) {
      console.error('ChatHandler: Error loading message history:', error);
      return [];
    }
  }
} 