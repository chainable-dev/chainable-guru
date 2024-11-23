'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
}

export function Messages({ chatId }: { chatId: string }) {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    fetch(`/api/chat/${chatId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
  }, [chatId])

  return messages.map((message) => (
    <Card
      key={message.id}
      className={cn(
        "p-3 md:p-4",
        "text-sm md:text-base",
        message.role === "user" 
          ? "bg-primary text-primary-foreground ml-8" 
          : "bg-muted mr-8"
      )}
    >
      {message.content}
    </Card>
  ))
} 