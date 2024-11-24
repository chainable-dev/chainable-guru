export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          provider: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          provider?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          provider?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          title: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          chat_id: string
          message_id: string
          is_upvoted: boolean
        }
        Insert: {
          chat_id: string
          message_id: string
          is_upvoted: boolean
        }
        Update: {
          chat_id?: string
          message_id?: string
          is_upvoted?: boolean
        }
      }
      file_uploads: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          bucket_id: string
          storage_path: string
          filename: string
          original_name: string
          content_type: string
          size: number
          url: string
          version: number
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          bucket_id: string
          storage_path: string
          filename: string
          original_name: string
          content_type: string
          size: number
          url: string
          version?: number
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          bucket_id?: string
          storage_path?: string
          filename?: string
          original_name?: string
          content_type?: string
          size?: number
          url?: string
          version?: number
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          created_at?: string
        }
      }
      suggestions: {
        Row: {
          id: string
          document_id: string
          document_created_at: string
          original_text: string
          suggested_text: string
          description: string | null
          is_resolved: boolean
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          document_created_at: string
          original_text: string
          suggested_text: string
          description?: string | null
          is_resolved?: boolean
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          document_created_at?: string
          original_text?: string
          suggested_text?: string
          description?: string | null
          is_resolved?: boolean
          user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
