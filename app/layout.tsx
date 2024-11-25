import { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ClientProviders } from '@/components/providers/client-providers'

import "./globals.css";
import "../styles/dark-mode.css";

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
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ClerkProvider>
					<ClientProviders>
						{children}
					</ClientProviders>
				</ClerkProvider>
			</body>
		</html>
	);
}
