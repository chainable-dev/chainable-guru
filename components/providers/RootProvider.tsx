"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import Disclaimer from '@/components/custom/disclaimer';
import { ThemeProvider } from './ThemeContext'; // Import your ThemeProvider

import { config } from '@/lib/wallet/config';

const queryClient = new QueryClient();

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={{
                        appName: 'Chainable Chat bot',
                        disclaimer: Disclaimer,
                    }}
                >
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}; 