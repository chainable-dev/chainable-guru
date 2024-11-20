'use client'

import { useEffect, useCallback } from 'react'
import { useAccount, useChainId, useConnect } from 'wagmi'
import { toast } from 'sonner'
import { useLocalStorage } from 'usehooks-ts'
import { base, baseSepolia } from 'viem/chains'

export function useWalletState() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const [wasConnected, setWasConnected] = useLocalStorage('wallet-was-connected', false)

  const getNetworkInfo = useCallback((id: number | undefined) => {
    switch (id) {
      case base.id:
        return {
          name: 'Base Mainnet',
          isSupported: true,
          chainId: base.id
        }
      case baseSepolia.id:
        return {
          name: 'Base Sepolia',
          isSupported: true,
          chainId: baseSepolia.id
        }
      default:
        return {
          name: 'Unknown Network',
          isSupported: false,
          chainId: id
        }
    }
  }, [])

  const networkInfo = getNetworkInfo(chainId)
  const isCorrectNetwork = networkInfo.isSupported

  // Handle reconnection
  useEffect(() => {
    const handleReconnect = async () => {
      try {
        if (!isConnected && wasConnected && connectors[0]) {
          await connect({ connector: connectors[0] })
        }
      } catch (error) {
        console.error('Wallet reconnection failed:', error)
        setWasConnected(false)
      }
    }

    // Try to reconnect on mount if previously connected
    handleReconnect()

    // Setup reconnection listeners
    const reconnectIfNeeded = () => {
      if (wasConnected && !isConnected) {
        handleReconnect()
      }
    }

    window.addEventListener('load', reconnectIfNeeded)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        reconnectIfNeeded()
      }
    })
    window.addEventListener('online', reconnectIfNeeded)

    return () => {
      window.removeEventListener('load', reconnectIfNeeded)
      document.removeEventListener('visibilitychange', () => {})
      window.removeEventListener('online', reconnectIfNeeded)
    }
  }, [isConnected, wasConnected, connect, connectors, setWasConnected])

  // Track connection state
  useEffect(() => {
    if (isConnected) {
      setWasConnected(true)
      if (!isCorrectNetwork) {
        toast.error('Please switch to Base Mainnet or Base Sepolia')
      } else {
        toast.success('Wallet Connected', {
          description: `Connected to ${networkInfo.name}`,
        })
      }
    }
  }, [isConnected, isCorrectNetwork, networkInfo.name, setWasConnected])

  return {
    isConnected,
    address,
    chainId,
    networkInfo,
    isCorrectNetwork,
    connectionStatus: isConnected 
      ? isCorrectNetwork 
        ? 'connected' 
        : 'wrong network'
      : wasConnected 
      ? 'reconnecting' 
      : 'disconnected'
  }
} 