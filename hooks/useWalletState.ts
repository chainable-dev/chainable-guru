import { useAccount, useBalance, useChainId } from 'wagmi'

export function useWalletState() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { 
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError 
  } = useBalance({
    address,
  })

  const networkInfo = {
    name: chainId === 8453 ? 'Base Mainnet' : 
          chainId === 84532 ? 'Base Sepolia' : 
          'Unknown Network'
  }

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
    walletClient: null
  }
}