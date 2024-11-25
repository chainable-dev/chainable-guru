'use client'

import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useVotes } from '@/hooks/use-votes'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface VoteButtonProps {
  chatId: string
  type: 'up' | 'down'
  className?: string
}

export function VoteButton({ chatId, type, className }: VoteButtonProps) {
  const { votes, isLoading, vote, fetchVotes } = useVotes(chatId)

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  const userVote = votes.find(v => v.value === (type === 'up' ? 1 : -1))
  const isActive = Boolean(userVote)

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'hover:bg-muted',
        isActive && 'text-primary bg-primary/10',
        className
      )}
      disabled={isLoading}
      onClick={() => vote(type === 'up' ? 1 : -1)}
    >
      {type === 'up' ? (
        <ThumbsUp className="h-4 w-4" />
      ) : (
        <ThumbsDown className="h-4 w-4" />
      )}
    </Button>
  )
} 