'use client'

import { Message } from 'ai'
import { ChatMessage } from './chat-message'

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  userId?: string | null
}

export function ChatMessages({ messages, isLoading, userId }: ChatMessagesProps) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      {messages.map((message, i) => (
        <ChatMessage 
          key={message.id} 
          message={message}
          isLoading={isLoading && i === messages.length - 1}
          userId={userId}
        />
      ))}
    </div>
  )
} 