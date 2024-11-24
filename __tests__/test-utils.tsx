import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "react-error-boundary";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig } from "wagmi";
import { http } from "viem";
import { mainnet } from "viem/chains";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
	return (
		<ErrorBoundary fallback={<div>Error</div>}>
			<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
				<WagmiProvider config={config}>
					<QueryClientProvider client={queryClient}>
						{children}
					</QueryClientProvider>
				</WagmiProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
};

const customRender = (ui: React.ReactElement, options = {}) =>
	render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
