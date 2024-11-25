import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { createConfig } from "wagmi";

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
	throw new Error("Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID");
}

export const chains = [base, baseSepolia] as const;
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const config = getDefaultConfig({
	appName: "Base App",
	projectId,
	chains,
	transports: {
		[base.id]: http(),
		[baseSepolia.id]: http(),
	},
});





