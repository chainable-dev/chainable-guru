"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Chainable",
	description: "Secure blockchain integration with AI",
	icons: {
		icon: [
			{ url: "/icons/chainable.svg", type: "image/svg+xml", sizes: "any" },
			{ url: "/icons/chainable-32.png", sizes: "32x32", type: "image/png" },
			{ url: "/icons/chainable-16.png", sizes: "16x16", type: "image/png" },
		],
		apple: [{ url: "/icons/chainable-180.png", sizes: "180x180" }],
		shortcut: "/icons/favicon.ico",
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { theme } = useTheme();

	return (
		<ClerkProvider
			appearance={{
				baseTheme: theme === "dark" ? dark : undefined,
				elements: {
					card: "bg-background",
					headerTitle: "text-foreground",
					headerSubtitle: "text-muted-foreground",
					socialButtonsBlockButton: "text-foreground",
					formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
					footerAction: "text-muted-foreground",
					formFieldLabel: "text-foreground",
					formFieldInput: "bg-background text-foreground",
				},
			}}
		>
			<div className="flex min-h-screen items-center justify-center">
				{children}
			</div>
		</ClerkProvider>
	);
}
