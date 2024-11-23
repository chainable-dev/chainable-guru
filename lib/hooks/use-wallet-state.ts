'use client'

import { useAccount, useBalance, useChainId } from 'wagmi'
import { base, baseSepolia } from 'viem/chains'
import { useEffect, useState } from 'react'
import { kv } from '@vercel/kv'

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId?: number
  networkInfo?: {
    name: string
    id: number
  }
  isCorrectNetwork: boolean
  balances?: {
    eth?: string
    usdc?: string
  }
}

const WALLET_KEY_PREFIX = 'wallet-state:'

export function useWalletState() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isCorrectNetwork: false
  })

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: address as `0x${string}`,
    chainId
  })

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address: address as `0x${string}`,
    token: chainId === base.id 
      ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base Mainnet USDC
      : '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
    chainId
  })

  useEffect(() => {
    const updateState = async () => {
      const newState = {
        address: address || null,
        isConnected,
        chainId,
        networkInfo: chainId ? {
          name: chainId === base.id ? 'Base Mainnet' : 'Base Sepolia',
          id: chainId
        } : undefined,
        isCorrectNetwork: chainId === base.id || chainId === baseSepolia.id,
        balances: {
          eth: ethBalance?.formatted,
          usdc: usdcBalance?.formatted
        }
      }

      setState(newState)

      // Store in KV if user is connected
      if (isConnected && address) {
        try {
          await kv.set(`${WALLET_KEY_PREFIX}${address}`, JSON.stringify(newState))
        } catch (error) {
          console.error('Failed to store wallet state:', error)
        }
      }
    }

    updateState()
  }, [address, isConnected, chainId, ethBalance, usdcBalance])

  return state
} 