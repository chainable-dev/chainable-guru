import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'viem/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';

// Get project ID from env
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
if (!projectId) throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID');

// Create wagmi config with RainbowKit
export const config = getDefaultConfig({
  appName: 'AI Chatbot',
  projectId,
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// Export the default chain for reference elsewhere
export const defaultChain = base; 