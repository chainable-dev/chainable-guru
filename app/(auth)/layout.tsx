import type { Viewport } from "next";

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
