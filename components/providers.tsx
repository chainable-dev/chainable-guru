'use client';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { baseSepolia, baseMainnet } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'Elron',
  projectId: 'f7a19335a1b448669e90b3b8e5befa05',
  chains: [
    {
      ...baseSepolia,
      rpcUrls: {
        default: { http: ['https://sepolia.base.org'] },
      }
    },
    {
      ...baseMainnet,
      rpcUrls: {
        default: { http: ['https://mainnet.base.org'] },
      }
    }
  ],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 