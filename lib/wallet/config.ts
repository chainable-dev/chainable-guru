import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { createConfig, type Config } from "wagmi";

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
	throw new Error("Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID");
}

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const supportedChains = [base, baseSepolia] as const;

const { connectors } = getDefaultWallets({
	appName: "AI Chat",
	projectId,
});

export const config = createConfig({
	chains: supportedChains,
	transports: {
		[base.id]: http(),
		[baseSepolia.id]: http(),
	},
	connectors,
});

export type WagmiConfig = typeof config;
