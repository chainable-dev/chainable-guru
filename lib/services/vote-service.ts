import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

type VoteType = 'upvote' | 'downvote'

interface VoteData {
  message_id: string
  user_id: string
  vote_type: VoteType
}

interface VoteCount {
  upvotes: number
  downvotes: number
}

export class VoteService {
  private static instance: VoteService | null = null
  private supabase: SupabaseClient

  private constructor() {
    this.supabase = createClient()
  }

  public static getInstance(): VoteService {
    if (!VoteService.instance) {
      VoteService.instance = new VoteService()
    }
    return VoteService.instance
  }

  async castVote({ message_id, user_id, vote_type }: VoteData) {
    const { data: existingVote } = await this.supabase
      .from('votes')
      .select()
      .match({ message_id, user_id })
      .single()

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        await this.supabase
          .from('votes')
          .delete()
          .match({ message_id, user_id })
        return { action: 'removed' }
      }
      
      await this.supabase
        .from('votes')
        .update({ vote_type })
        .match({ message_id, user_id })
      return { action: 'updated' }
    }

    await this.supabase
      .from('votes')
      .insert({
        message_id,
        user_id,
        vote_type,
        created_at: new Date().toISOString()
      })
    return { action: 'added' }
  }

  async getVoteCount(message_id: string): Promise<VoteCount> {
    const { data } = await this.supabase
      .from('votes')
      .select('vote_type')
      .eq('message_id', message_id)

    return (data || []).reduce((acc, vote) => {
      if (vote.vote_type === 'upvote') acc.upvotes++
      if (vote.vote_type === 'downvote') acc.downvotes++
      return acc
    }, { upvotes: 0, downvotes: 0 })
  }
}