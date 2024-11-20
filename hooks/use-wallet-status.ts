'use client'

import { useEffect, useCallback, useState } from 'react'
import { useAccount, useChainId, useConnect } from 'wagmi'
import { toast } from 'sonner'
import { useLocalStorage } from 'usehooks-ts'

export function useWalletStatus() {
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { connect, connectors } = useConnect()
  const [wasConnected, setWasConnected] = useLocalStorage('wallet-was-connected', false)
  const [isInitialized, setIsInitialized] = useState(false)

  const getNetworkName = (id: number | undefined) => {
    switch (id) {
      case 8453:
        return 'Base Mainnet'
      case 84532:
        return 'Base Sepolia'
      default:
        return 'Unknown Network'
    }
  }

  const handleReconnect = useCallback(async () => {
    if (!isInitialized) return

    try {
      if (!isConnected && wasConnected && connectors[0]) {
        toast.info('Attempting to reconnect wallet...')
        await connect({ connector: connectors[0] })
      }
    } catch (error) {
      console.error('Wallet reconnection failed:', error)
      toast.error('Failed to reconnect wallet')
      setWasConnected(false)
    }
  }, [isConnected, wasConnected, connect, connectors, setWasConnected, isInitialized])

  useEffect(() => {
    const initializeWallet = async () => {
      const storedWasConnected = localStorage.getItem('wallet-was-connected')
      if (storedWasConnected === 'true' && !isConnected && connectors[0]) {
        try {
          await connect({ connector: connectors[0] })
        } catch (error) {
          console.error('Initial wallet connection failed:', error)
        }
      }
      setIsInitialized(true)
    }

    initializeWallet()
  }, [connect, connectors, isConnected])

  useEffect(() => {
    if (isConnected) {
      setWasConnected(true)
    }
  }, [isConnected, setWasConnected])

  useEffect(() => {
    if (!isInitialized) return

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
    window.addEventListener('storage', (event) => {
      if (event.key === 'wallet-was-connected') {
        reconnectIfNeeded()
      }
    })

    return () => {
      window.removeEventListener('load', reconnectIfNeeded)
      document.removeEventListener('visibilitychange', () => {})
      window.removeEventListener('online', reconnectIfNeeded)
      window.removeEventListener('storage', () => {})
    }
  }, [isInitialized, wasConnected, isConnected, handleReconnect])

  useEffect(() => {
    if (isInitialized && isConnected) {
      const networkName = getNetworkName(chainId)
      toast.success('Wallet Connected', {
        description: `Connected to ${networkName}`,
      })
    }
  }, [isInitialized, isConnected, chainId])

  return {
    isConnected,
    address,
    chainId,
    networkName: getNetworkName(chainId),
    connectionStatus: isConnected 
      ? 'connected' 
      : !isInitialized 
      ? 'initializing'
      : wasConnected 
      ? 'reconnecting' 
      : 'disconnected'
  }
} 