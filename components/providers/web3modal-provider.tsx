"use client"

import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { WagmiConfig, createConfig, http } from 'wagmi'
import { mainnet, base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

const { connectors } = getDefaultWallets({
  appName: 'Elron AI',
  projectId,
  chains: [mainnet, base, baseSepolia]
})

const config = createConfig({
  chains: [mainnet, base, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors,
})

const queryClient = new QueryClient()

export default function Web3Provider({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[mainnet, base, baseSepolia]}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  )
} 