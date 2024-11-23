'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import Disclaimer from '@/components/custom/disclaimer';

import { config } from '@/lib/wallet/config';
import { useTheme } from 'next-themes';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'ElronAI',
            disclaimer: Disclaimer,
          }}
          theme={theme === 'dark' ? darkTheme({
            accentColor: 'hsl(var(--primary))',
            accentColorForeground: 'hsl(var(--primary-foreground))',
            borderRadius: 'small',
            fontStack: 'system',
            overlayBlur: 'small',
          }) : lightTheme({
            accentColor: 'hsl(var(--primary))',
            accentColorForeground: 'hsl(var(--primary-foreground))',
            borderRadius: 'small',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
          coolMode
          showRecentTransactions={true}
          
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 