import { useAccount, useBalance, useChainId, useWalletClient } from 'wagmi'
import { type WalletClient } from 'viem'

export interface WalletState {
  address: `0x${string}` | undefined
  isConnected: boolean
  chainId: number
  balance: string | undefined
  balanceSymbol: string | undefined
  isBalanceLoading: boolean
  isBalanceError: boolean
  networkInfo: {
    name: string
    isTestnet: boolean
  }
  isCorrectNetwork: boolean
  walletClient: WalletClient | null
}

export function useWalletState(): WalletState {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: walletClient = null } = useWalletClient()
  
  const { 
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError 
  } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId,
  })

  // Network info with testnet flag
  const networkInfo = {
    name: chainId === 8453 ? 'Base Mainnet' : 
          chainId === 84532 ? 'Base Sepolia' : 
          'Unknown Network',
    isTestnet: chainId === 84532
  }

  // Check if connected to Base Mainnet or Sepolia
  const isCorrectNetwork = chainId === 8453 || chainId === 84532

  return {
    address,
    isConnected,
    chainId,
    balance: balance?.formatted,
    balanceSymbol: balance?.symbol,
    isBalanceLoading,
    isBalanceError,
    networkInfo,
    isCorrectNetwork,
    walletClient
  }
}