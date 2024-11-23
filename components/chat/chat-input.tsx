'use client'

import { useState } from 'react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function ChatInput({ chatId }: { chatId: string }) {
  const [input, setInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: input })
      })
      setInput("")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className={cn(
          "resize-none",
          "pr-12",
          "text-sm md:text-base",
          "p-2 md:p-3",
          "min-h-[44px]"
        )}
        rows={1}
      />
      <Button
        type="submit" 
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
      >
        <span className="sr-only">Send</span>
        →
      </Button>
    </form>
  )
} 