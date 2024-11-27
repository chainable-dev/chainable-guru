import { z } from 'zod';
import { functionCallingService } from '../services/function-calling.service';

// Schema for wallet balance check
const balanceCheckSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().optional(),
});

// Schema for token transfer
const transferSchema = z.object({
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.string(),
  token: z.string().optional(),
  chainId: z.number().optional(),
});

// Register wallet functions
export function registerWalletFunctions() {
  // Check wallet balance
  functionCallingService.registerFunction({
    name: 'checkWalletBalance',
    description: 'Check the balance of a wallet address',
    parameters: balanceCheckSchema,
    handler: async ({ address, chainId }) => {
      // Implementation would go here
      // This is just an example
      return {
        address,
        balance: '0.0',
        chainId: chainId || 1,
      };
    },
  });

  // Transfer tokens
  functionCallingService.registerFunction({
    name: 'transferTokens',
    description: 'Transfer tokens to another address',
    parameters: transferSchema,
    handler: async ({ to, amount, token, chainId }) => {
      // Implementation would go here
      // This is just an example
      return {
        success: true,
        txHash: '0x...',
        to,
        amount,
        token: token || 'ETH',
        chainId: chainId || 1,
      };
    },
  });
}

// Example usage:
/*
await functionCallingService.callWithFunctions({
  messages: [
    { role: 'user', content: 'Check my wallet balance' }
  ],
  functions: ['checkWalletBalance']
});
*/ 