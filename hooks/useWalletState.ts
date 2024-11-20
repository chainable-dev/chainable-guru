import { useAccount, useChainId, useWalletClient } from 'wagmi';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function useWalletState() {
  const { address, isConnected } = useAccount(); // Use useAccount hook to get active wallet
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // Get count of wallet connections
  const getCount = () => {
    const count = localStorage.getItem('walletConnectionCount');
    return count ? parseInt(count) : 0;
  };

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

  useEffect(() => {
    if (isConnected && address) {
      if (networkInfo?.isSupported) {
        const count = getCount();
        localStorage.setItem('walletConnectionCount', (count + 1).toString());
        
        console.log('Wallet connected:', {
          address,
          chainId,
          network: networkInfo.name,
          connectionCount: count + 1
        });
      } else {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
      }
    }
  }, [isConnected, address, chainId, networkInfo]);

  return {
    address,
    isConnected,
    chainId,
    walletClient,
    networkInfo,
    isCorrectNetwork: networkInfo?.isSupported ?? false,
    connectionCount: getCount()
  };
}