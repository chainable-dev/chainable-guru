import { createFunctionCall } from '../types/function-calls';

export const getWalletBalanceFunctionCall = createFunctionCall(
  'getWalletBalance',
  'Get the balance of ETH and USDC for a wallet on Base network',
  {
    address: {
      type: 'string',
      description: 'The wallet address to check',
      required: true
    },
    chainId: {
      type: 'number',
      description: 'The chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)',
      required: true
    }
  }
);

export const checkWalletStateFunctionCall = createFunctionCall(
  'checkWalletState',
  'Check the connection state and network of a wallet',
  {
    address: {
      type: 'string',
      description: 'The wallet address to check',
      required: false
    },
    chainId: {
      type: 'number',
      description: 'The chain ID to verify',
      required: false
    }
  }
); 