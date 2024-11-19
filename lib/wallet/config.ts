import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'viem/chains';
import { http } from 'wagmi';

// Get project ID from env
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');

// Configure Base chain with custom name
const baseChain = {
  ...base,
  name: 'Base', // Custom name
  iconUrl: 'https://base.org/favicon.ico',
  iconBackground: '#0052FF',
  // Force Base as the only chain
  id: 8453,
  network: 'base',
};

// Create config with Base chain only
export const config = getDefaultConfig({
  appName: 'AI Chatbot',
  projectId,
  chains: [baseChain], // Only Base chain
  transports: {
    [baseChain.id]: http('https://mainnet.base.org'), // Base RPC
  },
  initialChain: baseChain.id, // Start on Base
}); 