'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId } from 'wagmi'

export function WalletStatus() {
  const { isConnected } = useAccount()
  const chainId = useChainId()

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

  useEffect(() => {
    if (isConnected) {
      toast.success('Wallet Connected', {
        description: `Connected to ${getNetworkName(chainId)}`,
      })
    }
  }, [isConnected, chainId])

  return <ConnectButton />
} 