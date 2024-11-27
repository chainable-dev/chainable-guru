"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { errorLogger } from "@/lib/utils/error-logger";

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { 
	error: Error; 
	resetErrorBoundary: () => void 
}) {
	return (
		<div role="alert" className="p-4 bg-background text-foreground">
			<p className="text-destructive">Something went wrong:</p>
			<pre className="text-sm mt-2 p-2 bg-muted rounded-md">{error.message}</pre>
			<button
				onClick={resetErrorBoundary}
				className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
			>
				Try again
			</button>
		</div>
	);
}

// Create config outside component to avoid recreation
const config = createConfig({
	chains: [mainnet],
	transports: {
		[mainnet.id]: http()
	}
});

// Create QueryClient outside component to avoid recreation
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			refetchOnWindowFocus: false,
		},
	},
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
	return (
		<ErrorBoundary 
			FallbackComponent={ErrorFallback}
			onError={(error) => {
				errorLogger.logError(error, { 
					component: 'ClientProviders',
					type: 'error-boundary'
				});
			}}
		>
			<WagmiProvider config={config}>
				<QueryClientProvider client={queryClient}>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem={false}
						disableTransitionOnChange
					>
						<TooltipProvider>
							<Suspense 
								fallback={
									<div className="flex items-center justify-center h-screen w-screen bg-background text-foreground">
										Loading...
									</div>
								}
							>
								{children}
							</Suspense>
							<Toaster 
								position="bottom-right" 
								theme="dark"
								toastOptions={{
									style: {
										background: 'hsl(var(--background))',
										color: 'hsl(var(--foreground))',
										border: '1px solid hsl(var(--border))'
									},
									className: 'text-sm font-medium'
								}}
							/>
						</TooltipProvider>
					</ThemeProvider>
				</QueryClientProvider>
			</WagmiProvider>
		</ErrorBoundary>
	);
}
