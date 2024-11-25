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
      user_settings: {
        Row: {
          id: string
          user_id: string
          sidebar_collapsed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sidebar_collapsed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          sidebar_collapsed?: boolean
          updated_at?: string
        }
      }
      user_wallets: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          network_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          network_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          wallet_address?: string
          network_id?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          network_id: string
          tx_hash: string
          tx_type: 'transfer' | 'trade'
          status: 'pending' | 'completed' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          network_id: string
          tx_hash: string
          tx_type: 'transfer' | 'trade'
          status?: 'pending' | 'completed' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'completed' | 'failed'
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          value: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          value?: number
          updated_at?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName]
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions]
  : never
