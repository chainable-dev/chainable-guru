"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useChainId } from "wagmi";
import { motion } from "framer-motion";

export function WalletStatus() {
	const { isConnected } = useAccount();
	const chainId = useChainId();
	const [prevChainId, setPrevChainId] = useState<number | undefined>();
	const [prevConnected, setPrevConnected] = useState<boolean>();

	const getNetworkName = (id: number | undefined) => {
		switch (id) {
			case 8453:
				return "Base Mainnet";
			case 84532:
				return "Base Sepolia";
			default:
				return "Unknown Network";
		}
	};

	useEffect(() => {
		// Handle initial connection
		if (isConnected && prevConnected === undefined) {
			toast.success("Wallet Connected", {
				description: `Connected to ${getNetworkName(chainId)}`,
			});
		}

		// Handle disconnection
		if (!isConnected && prevConnected) {
			toast.error("Wallet Disconnected", {
				description: "Your wallet has been disconnected",
			});
		}

		// Handle network change
		if (chainId !== prevChainId && prevChainId !== undefined) {
			toast.info("Network Changed", {
				description: `Switched to ${getNetworkName(chainId)}`,
			});
		}

		// Update previous states
		setPrevChainId(chainId);
		setPrevConnected(isConnected);
	}, [isConnected, chainId, prevChainId, prevConnected]);

	return (
		<motion.div 
			className="fixed top-4 right-4 z-50"
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<ConnectButton />
		</motion.div>
	);
}
