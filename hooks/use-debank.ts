import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface DebankBalance {
  chain: string
  symbol: string
  amount: string
  price: number
  value: number
}

interface DebankToken {
  chain: string
  symbol: string
  address: string
  decimals: number
  name: string
  logo_url: string
}

export function useDebank() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getBalances = useCallback(async (address: string): Promise<DebankBalance[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/debank/balances?address=${address}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch balances')
      }

      const data = await response.json()
      return data.balances
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to fetch balances')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTokens = useCallback(async (address: string): Promise<DebankToken[]> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/debank/tokens?address=${address}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch tokens')
      }

      const data = await response.json()
      return data.tokens
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to fetch tokens')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPortfolio = useCallback(async (address: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const [balances, tokens] = await Promise.all([
        getBalances(address),
        getTokens(address)
      ])

      return {
        balances,
        tokens,
        totalValue: balances.reduce((acc, b) => acc + b.value, 0)
      }
    } catch (err) {
      const error = err as Error
      setError(error)
      toast.error('Failed to fetch portfolio')
      return {
        balances: [],
        tokens: [],
        totalValue: 0
      }
    } finally {
      setIsLoading(false)
    }
  }, [getBalances, getTokens])

  return {
    getBalances,
    getTokens,
    getPortfolio,
    isLoading,
    error
  }
} 