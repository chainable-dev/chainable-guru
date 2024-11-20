'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';

import { config } from '@/lib/wallet/config';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'Chainable',
            learnMoreUrl: 'https://chainable.ai',
          }}
          theme={darkTheme({
            accentColor: '#3EB8B3', // Primary teal color
            accentColorForeground: '#FFFFFF', // High contrast white
            borderRadius: 'small',
            fontStack: 'rounded', // Brand font
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}