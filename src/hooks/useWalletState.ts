import { useAccount, useNetwork } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'

const SUPPORTED_CHAINS = [mainnet.id, base.id, baseSepolia.id] as const

export type SupportedChainId = typeof SUPPORTED_CHAINS[number]

export function useWalletState() {
  const { address, isConnected, connector: activeConnector } = useAccount()
  const { chain } = useNetwork()

  // Derived states
  const isWrongNetwork = chain ? !SUPPORTED_CHAINS.includes(chain.id as SupportedChainId) : false
  const truncatedAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : undefined
  const networkInfo = chain ? {
    id: chain.id,
    name: chain.name,
    network: chain.network,
    isTestnet: chain.testnet
  } : null

  return {
    // Basic account state
    address,
    isConnected,
    activeConnector,
    
    // Network info
    chain,
    chainId: chain?.id,
    networkInfo,
    
    // Derived state
    isWrongNetwork,
    truncatedAddress,
    isCorrectNetwork: !isWrongNetwork,

    // Helper methods
    formatAddress: (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  } as const
}

// Export type for components
export type WalletState = ReturnType<typeof useWalletState> 