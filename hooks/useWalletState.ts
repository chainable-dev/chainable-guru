import { useAccount, useChainId } from 'wagmi';
import { useAuth } from '@clerk/nextjs';

export function useWalletState() {
	const { address, isConnected } = useAccount();
	const chainId = useChainId();
	const { userId } = useAuth();

	const isCorrectNetwork = chainId === Number(process.env.NEXT_PUBLIC_CHAIN_ID);
	const isAuthorized = Boolean(userId);

	return {
		address,
		isConnected,
		isCorrectNetwork,
		isAuthorized,
		chainId,
	};
}
