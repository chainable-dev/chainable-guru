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
          theme={darkTheme({
            accentColor: '#0052FF',
            accentColorForeground: 'white', 
            borderRadius: 'small',
            fontStack: 'system',
            overlayBlur: 'small'
          })}
          modalSize="compact"
          coolMode
          showRecentTransactions={true}
          disclaimer={{
            title: "Terms of Service & Privacy Policy",
            content: "By connecting your wallet, you agree to our Terms of Service and acknowledge that you have read and understand our Privacy Policy",
            tosLink: "https://chainable.guru/terms",
            privacyLink: "https://chainable.guru/privacy"
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 