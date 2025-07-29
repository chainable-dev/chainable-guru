import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
	title: "Chainable",
	description: "Secure blockchain integration with AI",
	icons: {
		icon: [
			{ url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
			{ url: "/icon.png", sizes: "32x32", type: "image/png" },
		],
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
		shortcut: "/icon.png",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/icon.svg" type="image/svg+xml" />
				<link rel="alternate icon" href="/icon.png" />
				<link rel="apple-touch-icon" href="/apple-icon.png" />
			</head>
			<body className="antialiased" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
