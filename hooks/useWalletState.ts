import { useAccount, useChainId, useWalletClient, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { InjectedConnector } from 'wagmi/connectors/injected';

export function useWalletState() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { connectAsync: connect, isPending: isConnecting } = useConnect();
  const { disconnectAsync: disconnect } = useDisconnect();

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
          network: networkInfo.name
        });
      } else {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
      }
    }
  }, [isConnected, address, chainId, networkInfo]);

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    walletClient,
    networkInfo,
    isCorrectNetwork: networkInfo?.isSupported ?? false,
    connect,
    disconnect
  };
} 