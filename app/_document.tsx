import { KV } from '@vercel/kv';

// Initialize the KV store
const kv = new KV();

// Function to update the wallet state history
async function updateWalletHistory(walletId: string, newState: any) {
    await kv.set(`wallet:${walletId}:history`, newState);
}

// Function to get the wallet state history
async function getWalletHistory(walletId: string) {
    return await kv.get(`wallet:${walletId}:history`);
} 