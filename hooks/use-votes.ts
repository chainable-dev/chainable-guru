import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

interface Vote {
  id: string
  chat_id: string
  user_id: string
  value: number
  created_at: string
  updated_at: string
}

export function useVotes(chatId: string) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useAuth()

  const fetchVotes = useCallback(async () => {
    if (!chatId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/vote?chatId=${chatId}`)
      if (!response.ok) throw new Error('Failed to fetch votes')
      
      const data = await response.json()
      setVotes(data.votes)
    } catch (error) {
      console.error('Error fetching votes:', error)
      toast.error('Failed to load votes')
    } finally {
      setIsLoading(false)
    }
  }, [chatId])

  const vote = useCallback(async (value: number) => {
    if (!chatId || !userId) return

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, value })
      })

      if (!response.ok) throw new Error('Failed to vote')
      
      await fetchVotes()
      toast.success('Vote recorded')
    } catch (error) {
      console.error('Error voting:', error)
      toast.error('Failed to record vote')
    }
  }, [chatId, userId, fetchVotes])

  return {
    votes,
    isLoading,
    vote,
    fetchVotes
  }
} 