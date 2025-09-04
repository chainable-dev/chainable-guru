"use client";

import dynamic from "next/dynamic";

import { Toaster } from "@/components/ui/toast";

const ClientProviders = dynamic(
	() =>
		import("@/components/providers/client-providers").then(
			(mod) => mod.ClientProviders,
		),
	{ ssr: false },
);

export function RootProvider({ children }: { children: React.ReactNode }) {
	return (
		<ClientProviders>
			{children}
			<Toaster />
		</ClientProviders>
	);
}
