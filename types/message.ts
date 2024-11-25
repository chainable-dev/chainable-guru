export type Role = 'system' | 'user' | 'assistant' | 'function'

export interface DatabaseMessage {
  id: string
  chat_id: string
  role: string
  content: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: Role
  content: string
  chat_id: string
  createdAt: string
  updatedAt: string
  name?: string
  function_call?: {
    name: string
    arguments: string
  }
}

export interface UIMessage extends Message {
  isLoading?: boolean
  error?: boolean
}

export function isUIMessage(message: Message | UIMessage): message is UIMessage {
  return 'isLoading' in message || 'error' in message
}

export interface SystemMessage extends Message {
  role: 'system'
}

export interface UserMessage extends Message {
  role: 'user'
}

export interface AssistantMessage extends Message {
  role: 'assistant'
}

export interface FunctionMessage extends Message {
  role: 'function'
  name: string
}

export type AnyMessage = SystemMessage | UserMessage | AssistantMessage | FunctionMessage

export interface ChatRequest {
  messages: Message[]
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface ChatResponse {
  id: string
  choices: {
    message: Message
    finish_reason: string
    index: number
  }[]
  created: number
  model: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
