"use client";

import { useEffect, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wallet/config";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/components/ui/toast";
import Disclaimer from "@/components/custom/disclaimer";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider
					theme={darkTheme({
						accentColor: "#BD93F9",
						accentColorForeground: "#F8F8F2",
						fontStack: "system",
						overlayBlur: "small",
						borderRadius: "medium",
					})}
					appInfo={{
						appName: "ElronAI",
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
	);
}

export function RootProvider({ children }: { children: React.ReactNode }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Remove any Dark Reader attributes that might cause hydration issues
		const html = document.documentElement;
		html.removeAttribute('data-darkreader-mode');
		html.removeAttribute('data-darkreader-scheme');
		html.removeAttribute('data-darkreader-proxy-injected');
		
		// Force dark mode
		html.classList.add('dark');
		html.style.colorScheme = 'dark';
		
		setMounted(true);
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			forcedTheme="dark"
			enableSystem={false}
			disableTransitionOnChange
		>
			<TooltipPrimitive.Provider>
				<Providers>
					<div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
						{children}
					</div>
					<Toaster
						theme="dark"
						toastOptions={{
							style: {
								background: "hsl(var(--background))",
								color: "hsl(var(--foreground))",
								border: "1px solid hsl(var(--border))"
							}
						}}
					/>
				</Providers>
			</TooltipPrimitive.Provider>
		</ThemeProvider>
	);
}
