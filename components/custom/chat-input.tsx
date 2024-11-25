'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SendHorizontal } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ChatInputProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          tabIndex={0}
          rows={1}
          value={input}
          onChange={handleInputChange}
          placeholder="Send a message"
          spellCheck={false}
          className="pr-12 resize-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as any)
            }
          }}
        />
        <Button 
          type="submit"
          size="icon"
          disabled={isLoading || input.trim().length === 0}
          className="absolute right-2"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
} 