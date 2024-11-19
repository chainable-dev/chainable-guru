'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider ,darkTheme} from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import Disclaimer from '@/components/custom/disclaimer';

import { config } from '@/lib/wallet/config';

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={{
                        appName: 'Chainable Chat bot',
                        disclaimer: Disclaimer,
                    }}
                    theme={darkTheme()}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
} 