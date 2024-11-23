export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          message_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          vote_type: 'upvote' | 'downvote'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Chat = Database['public']['Tables']['chats']['Row']
export type Vote = Database['public']['Tables']['votes']['Row'] 