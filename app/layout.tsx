import { Metadata, Viewport } from "next"
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'
import Web3Provider from '@/components/providers/web3modal-provider'
import '@/styles/globals.css'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
})

export const metadata: Metadata = {
	metadataBase: new URL("https://chainable.guru"),
	title: "Elron - AI web3 chatbot",
	description: "Elron is an AI chatbot that integrates with blockchain technologies.",
	icons: {
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
		shortcut: "/favicon.ico",
	},
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<Web3Provider>
						{children}
						<Toaster />
					</Web3Provider>
				</ThemeProvider>
			</body>
		</html>
	)
}
