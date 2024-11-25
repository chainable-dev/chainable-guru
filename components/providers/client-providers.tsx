"use client";

import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { WagmiConfig } from 'wagmi'
import { ThemeProvider } from 'next-themes'
import { chains, config } from '@/lib/wagmi'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const themeConfig = {
	accentColor: '#7b3fe4',
	accentColorForeground: 'white',
	radius: 'medium' as const,
	fontStack: 'system' as const
}

const queryClient = new QueryClient()

export function ClientProviders({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
			>
				{mounted ? (
					<WagmiConfig config={config}>
						<RainbowKitProvider
							theme={darkTheme(themeConfig)}
							initialChain={base}
						>
							{children}
						</RainbowKitProvider>
					</WagmiConfig>
				) : (
					<div className="invisible">{children}</div>
				)}
				<Toaster />
			</ThemeProvider>
		</QueryClientProvider>
	)
}
