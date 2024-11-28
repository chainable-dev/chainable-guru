import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Chainable",
	description: "Secure blockchain integration with AI",
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
};

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			{children}
		</div>
	);
}
