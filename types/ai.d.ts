declare module 'ai' {
  export interface Message {
    id: string;
    role: 'system' | 'user' | 'assistant' | 'function' | 'data' | 'tool';
    content: string;
    createdAt?: Date;
  }

  export interface Attachment {
    name: string;
    type: string;
    size: number;
    url?: string;
  }

  export interface ChatRequestOptions {
    options?: {
      body?: {
        id?: string;
        modelId?: string;
        messages?: Array<Pick<Message, 'role' | 'content'>>;
      };
    };
  }

  export interface ChatHook {
    messages: Message[];
    setMessages: (messages: Message[]) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions) => void;
    input: string;
    setInput: (input: string) => void;
    append: (message: Message) => void;
    isLoading: boolean;
    stop: () => void;
    data?: any;
  }

  export function useChat(config: {
    body?: {
      id?: string;
      modelId?: string;
      messages?: Array<Pick<Message, 'role' | 'content'>>;
    };
    initialMessages?: Message[];
    onFinish?: () => void;
  }): ChatHook;
} 