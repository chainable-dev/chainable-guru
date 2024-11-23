'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { ThemeProvider } from 'next-themes';
import Disclaimer from '@/components/custom/disclaimer';
import { config } from '@/lib/wallet/config';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#BD93F9',
              accentColorForeground: '#F8F8F2',
              fontStack: 'system',
              overlayBlur: 'small',
              borderRadius: 'medium',
            })}
            appInfo={{
              appName: 'ElronAI',
              disclaimer: Disclaimer,
            }}
            modalSize="compact"
            coolMode
            showRecentTransactions={true}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
} 