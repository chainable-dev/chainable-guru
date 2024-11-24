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
			{ rel: "icon", url: "/favicon.ico" },
			{ rel: "icon", url: "/icons/icon.svg", type: "image/svg+xml" },
			{ rel: "icon", url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
			{ rel: "icon", url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [
			{ url: "/icons/apple-touch-icon.png", sizes: "180x180" },
		],
		other: [
			{
				rel: "mask-icon",
				url: "/icons/icon.svg",
				color: "#000000",
			},
		],
	},
	manifest: "/manifest.json",
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
			<head>
				<link rel="manifest" href="/manifest.json" />
				<link rel="icon" href="/icons/favicon.ico" />
				<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
			</head>
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
