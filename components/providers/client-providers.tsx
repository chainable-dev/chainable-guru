"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

export function ClientProviders({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="dark"
			forcedTheme="dark"
			enableSystem={false}
		>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</ThemeProvider>
	);
}
