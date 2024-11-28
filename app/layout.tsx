import { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "@/components/providers/root-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Chainable",
	description: "Secure blockchain integration with AI",
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	}
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
