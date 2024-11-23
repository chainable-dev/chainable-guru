import { z } from 'zod';
import { ethers } from 'ethers';
import { getWalletBalanceFunctionCall } from './function-calls';

export const getWalletBalanceSchema = z.object({
  address: z.string().describe('The wallet address to check'),
  chainId: z.number().describe('The chain ID of the connected wallet')
});

export type GetWalletBalanceParams = z.infer<typeof getWalletBalanceSchema>;

const networkConfig = {
  8453: {
    rpcUrl: 'https://mainnet.base.org',
    name: 'Base Mainnet',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  84532: {
    rpcUrl: 'https://sepolia.base.org',
    name: 'Base Sepolia',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  }
} as const;

export const getWalletBalance = {
  description: getWalletBalanceFunctionCall.description,
  parameters: getWalletBalanceSchema,
  execute: async ({ address, chainId }: GetWalletBalanceParams) => {
    try {
      if (!address) {
        return {
          type: 'tool-result',
          result: {
            isConnected: false,
            address: null,
            chainId: null,
            network: 'Not Connected',
            error: 'No wallet address provided',
            details: 'Please connect your wallet first'
          }
        };
      }

      const network = networkConfig[chainId as keyof typeof networkConfig];
      if (!network) {
        return {
          type: 'tool-result',
          result: {
            isConnected: true,
            address,
            chainId,
            network: 'Unsupported Network',
            error: `Unsupported chain ID: ${chainId}`,
            details: 'Please connect to Base Mainnet or Base Sepolia'
          }
        };
      }

      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      const [ethBalance, usdcBalance] = await Promise.all([
        provider.getBalance(address),
        new ethers.Contract(
          network.usdcAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        ).balanceOf(address)
      ]);

      return {
        type: 'tool-result',
        result: {
          isConnected: true,
          address,
          chainId,
          network: network.name,
          balances: {
            eth: ethers.formatEther(ethBalance),
            usdc: (Number(usdcBalance) / 1e6).toString()
          }
        }
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return {
        type: 'tool-result',
        result: {
          isConnected: true,
          address,
          chainId,
          network: 'Error',
          error: 'Failed to fetch wallet balance',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}; 