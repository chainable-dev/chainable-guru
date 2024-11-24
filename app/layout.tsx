import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: {
		default: "Chainable",
		template: "%s | Chainable",
	},
	description: "Secure blockchain integration with AI",
	icons: {
		icon: [
			{ url: "/icons/chainable.svg", type: "image/svg+xml", sizes: "any" },
			{ url: "/icons/chainable-32.png", sizes: "32x32", type: "image/png" },
			{ url: "/icons/chainable-16.png", sizes: "16x16", type: "image/png" },
		],
		apple: [{ url: "/icons/chainable-180.png", sizes: "180x180" }],
		shortcut: "/icons/favicon.ico",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head />
			<body className={cn(
				"min-h-screen bg-background font-sans antialiased",
				inter.className
			)}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
