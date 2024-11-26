import { Metadata, Viewport } from 'next'

import { RootProvider } from "@/components/providers/root-provider";

import "./globals.css";
import "../styles/dark-mode.css";

export const metadata: Metadata = {
	title: 'AI Chat Bot',
	description: 'An AI chat bot built with Next.js and Vercel AI SDK',
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

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
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/icon.svg" type="image/svg+xml" />
				<link rel="apple-touch-icon" href="/apple-icon.png" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</head>
			<body className="antialiased bg-background text-foreground dark:bg-gray-900">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
