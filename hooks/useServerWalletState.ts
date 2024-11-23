"use server";

import { kv } from "@vercel/kv";

interface WalletState {
	address: string | null;
	isConnected: boolean;
	chainId?: number;
	networkInfo?: {
		name: string;
		id: number;
	};
	isCorrectNetwork: boolean;
	balances?: {
		eth?: string;
		usdc?: string;
	};
}

export async function getServerWalletState(
	address: string,
): Promise<WalletState | null> {
	try {
		const state = await kv.get<WalletState>(`wallet:${address}`);
		return state;
	} catch (error) {
		console.error("Failed to get wallet state:", error);
		return null;
	}
}
