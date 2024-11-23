import type { ChatRequest, Message } from 'ai'

export interface Attachment {
  url: string
  name: string
  contentType: string
  path?: string
}

export interface ExtendedChatRequest extends ChatRequest {
  experimental_attachments?: Attachment[]
}

export interface ExtendedMessage extends Message {
  attachments?: Attachment[]
} 