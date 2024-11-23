import type { SupabaseClient } from '@supabase/supabase-js'

interface DebankPortfolio {
  total_usd: number
  chain_list: {
    id: string
    name: string
    native_token_id: string
    usd_value: number
    tokens: Array<{
      symbol: string
      amount: number
      price: number
      usd_value: number
    }>
  }[]
}

export class DeBankService {
  private static instance: DeBankService | null = null
  private readonly DEBANK_API_URL = 'https://pro-openapi.debank.com/v1'
  private readonly API_KEY = process.env.DEBANK_API_KEY

  private constructor() {}

  public static getInstance(): DeBankService {
    if (!DeBankService.instance) {
      DeBankService.instance = new DeBankService()
    }
    return DeBankService.instance
  }

  async getPortfolio(address: string): Promise<DebankPortfolio> {
    try {
      const response = await fetch(
        `${this.DEBANK_API_URL}/user/total_balance?id=${address}`,
        {
          headers: {
            'Accept': 'application/json',
            'AccessKey': this.API_KEY || ''
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data')
      }

      return await response.json()
    } catch (error) {
      console.error('DeBankService getPortfolio error:', error)
      throw new Error('Failed to get portfolio data')
    }
  }

  async getTokenBalances(address: string, chainId: string) {
    try {
      const response = await fetch(
        `${this.DEBANK_API_URL}/user/token_list?id=${address}&chain_id=${chainId}`,
        {
          headers: {
            'Accept': 'application/json',
            'AccessKey': this.API_KEY || ''
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch token balances')
      }

      return await response.json()
    } catch (error) {
      console.error('DeBankService getTokenBalances error:', error)
      throw new Error('Failed to get token balances')
    }
  }
} 