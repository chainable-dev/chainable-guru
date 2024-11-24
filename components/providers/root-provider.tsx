"use client";

import { ThemeProvider } from "next-themes";
import { ClientProviders } from "./client-providers";
import { Toaster } from "@/components/ui/toaster";

interface RootProviderProps {
	children: React.ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ClientProviders>
				{children}
				<Toaster />
			</ClientProviders>
		</ThemeProvider>
	);
}
