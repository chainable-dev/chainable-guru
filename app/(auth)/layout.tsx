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
	return (
		<div className="min-h-screen bg-background antialiased">
			<main className="flex min-h-screen flex-col">
				{children}
			</main>
		</div>
	);
}
