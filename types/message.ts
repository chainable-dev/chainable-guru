import type { Message as AIMessage } from 'ai';

export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export type VoteType = 'up' | 'down';

export interface Vote {
  id: string;
  message_id: string;
  chat_id: string;
  type: VoteType;
  created_at: string;
  updated_at: string;
}

export interface BaseMessage {
  id: string;
  role: MessageRole;
  content: string;
  chat_id: string;
  created_at: string;
  updated_at: string;
  name?: string;
}

export interface SystemMessage extends BaseMessage {
  role: 'system';
}

export interface UserMessage extends BaseMessage {
  role: 'user';
  attachments?: Array<{
    type: string;
    url: string;
    name?: string;
  }>;
}

export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface FunctionMessage extends BaseMessage {
  role: 'function';
  name: string;
}

export type Message = SystemMessage | UserMessage | AssistantMessage | FunctionMessage;

export interface UIMessage {
  id: string;
  role: MessageRole;
  content: string;
  chat_id: string;
  created_at: string;
  updated_at: string;
  isLoading?: boolean;
  error?: boolean;
}

export interface ChatMessage extends BaseMessage {
  vote?: Vote;
}

export interface MessageProps {
  message: ChatMessage;
  chatId: string;
  isLoading?: boolean;
  vote?: Vote;
}

export interface ChatRequest {
  messages: Message[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function isUIMessage(message: Message | UIMessage): message is UIMessage {
  return 'isLoading' in message || 'error' in message;
}

export function isAssistantMessage(message: Message): message is AssistantMessage {
  return message.role === 'assistant';
}

export function isUserMessage(message: Message): message is UserMessage {
  return message.role === 'user';
}

export function isSystemMessage(message: Message): message is SystemMessage {
  return message.role === 'system';
}

export function isFunctionMessage(message: Message): message is FunctionMessage {
  return message.role === 'function';
}
