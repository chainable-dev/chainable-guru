import { KV } from '@vercel/kv';

// Initialize the KV store
const kv = new KV();

// Function to update the wallet state and track history
export async function updateWalletState(walletId: string, newState: any) {
    const historyKey = `wallet:${walletId}:history`;
    const currentHistory = (await kv.get(historyKey)) || [];
    currentHistory.push(newState);
    await kv.set(historyKey, currentHistory);
}

// Function to get the wallet state history
export async function getWalletHistory(walletId: string) {
    return await kv.get(`wallet:${walletId}:history`);
}

// Function to clear the wallet state
export async function clearWalletState(walletId: string) {
    await kv.delete(`wallet:${walletId}:state`);
    await kv.delete(`wallet:${walletId}:history`);
} 