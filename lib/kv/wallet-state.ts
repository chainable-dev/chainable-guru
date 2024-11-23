import { kv } from '@vercel/kv'

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId?: number
  networkInfo?: {
    name: string
    id: number
  }
  isCorrectNetwork: boolean
  lastUpdated: number
}

const WALLET_STATE_KEY = 'wallet:state:'

export async function setWalletState(userId: string, state: Omit<WalletState, 'lastUpdated'>) {
  const walletState: WalletState = {
    ...state,
    lastUpdated: Date.now()
  }
  
  await kv.set(`${WALLET_STATE_KEY}${userId}`, JSON.stringify(walletState))
  return walletState
}

export async function getWalletState(userId: string): Promise<WalletState | null> {
  const state = await kv.get(`${WALLET_STATE_KEY}${userId}`)
  return state ? JSON.parse(state as string) : null
}

export async function clearWalletState(userId: string) {
  await kv.del(`${WALLET_STATE_KEY}${userId}`)
} 