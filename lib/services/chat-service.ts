import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Chat } from '@/lib/supabase/types'

export class ChatService {
  private static instance: ChatService | null = null
  private supabase: SupabaseClient

  private constructor() {
    this.supabase = createClient()
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  async getChats(userId: string): Promise<Chat[]> {
    const { data } = await this.supabase
      .from('chats')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return data || []
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    const { data } = await this.supabase
      .from('chats')
      .select()
      .eq('id', chatId)
      .single()

    return data
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    await this.supabase
      .from('chats')
      .delete()
      .match({ id: chatId, user_id: userId })
  }
} 