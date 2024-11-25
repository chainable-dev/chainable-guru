import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { base, baseSepolia } from "viem/chains";

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
	throw new Error("Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID");
}

export const chains = [base, baseSepolia] as const;
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// Create wagmi config using RainbowKit's getDefaultConfig
export const wagmiConfig = getDefaultConfig({
	appName: "Chainable AI",
	projectId,
	chains,
	transports: {
		[base.id]: http(),
		[baseSepolia.id]: http(),
	},
});
