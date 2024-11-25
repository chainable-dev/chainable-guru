import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './types'
import { cache } from 'react'

// Create a cached server component client to avoid duplicates
export const createServerClient = cache(async () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
})

// Helper function to get votes
export async function getVotes(chatId: string) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('chat_id', chatId)

    if (error) {
      console.error('Error fetching votes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// Helper function to create vote
export async function createVote(chatId: string, userId: string, value: number) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('votes')
      .insert([
        { chat_id: chatId, user_id: userId, value }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating vote:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

// Helper function to update vote
export async function updateVote(id: string, value: number) {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('votes')
      .update({ value })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating vote:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
