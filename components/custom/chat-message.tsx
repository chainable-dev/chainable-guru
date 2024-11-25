'use client'

import { Message } from 'ai'
import { cn } from '@/lib/utils'
import { BetterTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Copy, Bot, User } from 'lucide-react'
import { useVotes } from '@/hooks/use-votes'
import { VoteButton } from '@/components/ui/vote-button'
import { useState } from 'react'
import { toast } from 'sonner'

interface ChatMessageProps {
  message: Message
  isLoading: boolean
  userId?: string | null
}

export function ChatMessage({ message, isLoading, userId }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const onCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Message copied to clipboard')
  }

  return (
    <div className={cn('flex items-start gap-4 py-4', isUser && 'justify-end')}>
      {!isUser && (
        <div className="rounded-full bg-primary/10 p-2">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={cn('group flex flex-col gap-2', isUser && 'items-end')}>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {isUser ? 'You' : 'AI'}
          </div>
          {!isUser && userId && (
            <div className="flex items-center gap-1">
              <VoteButton chatId={message.id} type="up" />
              <VoteButton chatId={message.id} type="down" />
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-lg px-4 py-2 max-w-prose',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {message.content}
        </div>
        {!isUser && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <BetterTooltip content={copied ? 'Copied!' : 'Copy message'}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </BetterTooltip>
          </div>
        )}
      </div>
      {isUser && (
        <div className="rounded-full bg-primary p-2">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
} 