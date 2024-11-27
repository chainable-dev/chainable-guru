import { Metadata } from "next";
import { Viewport } from 'next';

import { RootProvider } from "@/components/providers/root-provider";

import "./globals.css";
import "../styles/dark-mode.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://chainable.guru"),
	title: "Elron - AI web3 chatbot",
	description:
		"Elron is an AI chatbot that integrates with blockchain technologies.",
	manifest: "/site.webmanifest",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml" },
			{ url: "/favicon-16x16.webp", sizes: "16x16", type: "image/webp" },
			{ url: "/favicon-32x32.webp", sizes: "32x32", type: "image/webp" },
			{ url: "/favicon-48x48.webp", sizes: "48x48", type: "image/webp" },
			{ url: "/favicon-180x180.webp", sizes: "180x180", type: "image/webp" },
			{ url: "/android-chrome-192x192.png", sizes: "192x192" },
			{ url: "/android-chrome-512x512.png", sizes: "512x512" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
		shortcut: "/favicon.ico",
		other: [
			{
				rel: "mask-icon",
				url: "/icon.svg",
			},
		],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Elron AI",
	},
	formatDetection: {
		telephone: false,
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "white" },
		{ media: "(prefers-color-scheme: dark)", color: "#171717" }
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
              try {
                if (!localStorage.theme) localStorage.theme = 'dark';
                document.documentElement.classList.add('dark');
              } catch (_) {}
            `,
					}}
				/>
			</head>
			<body className="antialiased bg-background text-foreground dark:bg-gray-900 overflow-hidden">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
