import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAccount, useChainId, useWalletClient, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';

export function useWalletState() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [balance, setBalance] = useState<{
    formatted: string;
    symbol: string;
    value: bigint;
  }>();

  // Fetch balance manually
  useEffect(() => {
    async function getBalance() {
      if (!address || !publicClient) return;
      
      try {
        const value = await publicClient.getBalance({ address });
        setBalance({
          formatted: formatEther(value),
          symbol: 'ETH',
          value
        });
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    }

    getBalance();
    
    // Poll for balance updates
    const interval = setInterval(getBalance, 4000);
    
    return () => clearInterval(interval);
  }, [address, publicClient]);

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
          balance: balance?.formatted
        });
      } else {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
      }
    }
  }, [isConnected, address, chainId, networkInfo, balance?.formatted]);

  return {
    address,
    isConnected, 
    chainId,
    walletClient,
    networkInfo,
    isCorrectNetwork: networkInfo?.isSupported ?? false,
    balance: balance?.formatted,
    balanceSymbol: balance?.symbol,
    balanceValue: balance?.value
  };
}