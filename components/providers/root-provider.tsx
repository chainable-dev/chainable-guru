"use client";

import { useEffect, useState } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wallet/config";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/components/ui/toast";
import Disclaimer from "@/components/custom/disclaimer";

// Create a client
const queryClient = new QueryClient();

export function RootProvider({ children }: { children: React.ReactNode }) {
	// Add client-side only mounting
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration issues by not rendering until mounted
	if (!mounted) {
		return null;
	}

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			forcedTheme="dark"
			enableSystem={false}
			disableTransitionOnChange
		>
			<TooltipProvider>
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
							<Toaster />
						</RainbowKitProvider>
					</QueryClientProvider>
				</WagmiProvider>
			</TooltipProvider>
		</ThemeProvider>
	);
}
