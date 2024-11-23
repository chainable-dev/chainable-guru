import { base, baseSepolia } from "viem/chains";
import { http } from "viem";
import { createConfig } from "wagmi";

export const config = createConfig({
	chains: [base, baseSepolia],
	transports: {
		[base.id]: http(),
		[baseSepolia.id]: http(),
	},
});
