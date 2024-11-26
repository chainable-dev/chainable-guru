import { Metadata, Viewport } from "next";

import { RootProvider } from "@/components/providers/root-provider";

import "./globals.css";
import "../styles/dark-mode.css";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export const metadata: Metadata = {
	metadataBase: new URL("https://chainable.guru"),
	title: "Elron - AI web3 chatbot",
	description:
		"Elron is an AI chatbot that integrates with blockchain technologies.",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
		shortcut: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="antialiased bg-background text-foreground dark:bg-gray-900">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
