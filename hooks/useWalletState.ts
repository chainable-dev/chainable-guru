import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAccount, useBalance, useChainId, useWalletClient } from 'wagmi';

export function useWalletState() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  
  const { data: balanceData, isError: isBalanceError } = useBalance({
    address,
    chainId,
    watch: true
  });

  // Memoize network info
  const networkInfo = useMemo(() => {
    if (!chainId) return null;

    return {
      name: chainId === 8453 ? 'Base Mainnet' : 
            chainId === 84532 ? 'Base Sepolia' : 
            'Unsupported Network',
      isSupported: [8453, 84532].includes(chainId)
    };
  }, [chainId]);

  // Watch for wallet state changes
  useEffect(() => {
    if (isConnected && address) {
      if (networkInfo?.isSupported) {
        console.log('Wallet connected:', {
          address,
          chainId,
          network: networkInfo.name,
          balance: balanceData?.formatted
        });
      } else {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
      }
    }
  }, [isConnected, address, chainId, networkInfo, balanceData?.formatted]);

  return {
    address,
    isConnected,
    chainId,
    walletClient,
    networkInfo,
    isCorrectNetwork: networkInfo?.isSupported ?? false,
    balance: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
    balanceValue: balanceData?.value
  };
} 