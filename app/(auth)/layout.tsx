"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

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
