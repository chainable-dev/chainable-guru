import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type Database } from './types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Utility functions for wallet management
export const walletQueries = {
  async createWallet(
    userId: string,
    walletAddress: string,
    networkId: string
  ) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('user_wallets').insert({
        user_id: userId,
        wallet_address: walletAddress,
        network_id: networkId
      })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  },

  async getUserWallets(userId: string) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting wallets:', error)
      return []
    }
  },

  async trackTransaction({
    userId,
    walletAddress,
    networkId,
    txHash,
    txType
  }: {
    userId: string
    walletAddress: string
    networkId: string
    txHash: string
    txType: 'transfer' | 'trade'
  }) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from('transactions').insert({
        user_id: userId,
        wallet_address: walletAddress,
        network_id: networkId,
        tx_hash: txHash,
        tx_type: txType,
        status: 'pending'
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error tracking transaction:', error)
      throw error
    }
  }
}
