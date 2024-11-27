import "./globals.css";
import { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import { RootProvider } from "@/components/providers/root-provider";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export const metadata: Metadata = {
	metadataBase: new URL("https://chainable.guru"),
	title: "AI Task Manager",
	description: "Manage and monitor your AI tasks",
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
		<html 
			lang="en" 
			suppressHydrationWarning 
			className={cn(
				inter.className,
				"dark"
			)}
		>
			<body className="min-h-screen bg-background font-sans antialiased">
				<RootProvider>
					<div className="relative flex min-h-screen flex-col">
						<main className="flex-1">
							{children}
						</main>
					</div>
				</RootProvider>
			</body>
		</html>
	);
}
