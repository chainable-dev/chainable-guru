import { useAccount } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'

const SUPPORTED_CHAINS = [mainnet.id, base.id, baseSepolia.id]

export function useWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    chain,
    chainId
  } = useAccount()

  // Derived state
  const isWrongNetwork = chain ? !SUPPORTED_CHAINS.includes(chain.id) : false
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined

  return {
    // Basic account state
    address,
    truncatedAddress,
    isConnected,
    isConnecting,
    isDisconnected,
    status,
    
    // Chain info
    chain,
    chainId,
    isWrongNetwork,

    // Helper methods
    formatAddress: (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
}

export type WalletHook = ReturnType<typeof useWallet> 