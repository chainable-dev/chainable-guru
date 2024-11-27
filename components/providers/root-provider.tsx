"use client";

import dynamic from "next/dynamic";

const ClientProviders = dynamic(
	() =>
		import("@/components/providers/client-providers").then(
			(mod) => mod.ClientProviders,
		),
	{ ssr: false },
);

export function RootProvider({ children }: { children: React.ReactNode }) {
	return <ClientProviders>{children}</ClientProviders>;
}
