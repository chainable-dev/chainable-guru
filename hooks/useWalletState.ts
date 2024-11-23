import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function useWalletState() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize wallet state after hydration
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Watch for wallet state changes
  useEffect(() => {
    if (!isInitialized) return;

    if (isConnected && address) {
      if (networkInfo?.isSupported) {
        console.log('Wallet connected:', {
          address,
          chainId,
          network: networkInfo.name
        });
      } else {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
      }
    }
  }, [isInitialized, isConnected, address, chainId, networkInfo]);

  return {
    address,
    isConnected,
    chainId,
    walletClient,
    networkInfo,
    isCorrectNetwork: networkInfo?.isSupported ?? false,
    isInitialized
  };
} 