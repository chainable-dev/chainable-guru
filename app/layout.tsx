import { Metadata, Viewport } from "next";
import { RootProvider } from "@/components/providers/root-provider";
import "./globals.css";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#000000",
	colorScheme: "dark",
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
		<html lang="en" className="dark" style={{ colorScheme: "dark" }}>
			<head>
				<meta name="color-scheme" content="dark" />
			</head>
			<body className="min-h-screen bg-background font-sans antialiased">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
