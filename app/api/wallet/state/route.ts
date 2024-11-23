import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { kv } from '@vercel/kv'

const WALLET_KEY_PREFIX = 'wallet-state:'

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId?: number
  networkInfo?: {
    name: string
    id: number
  }
  isCorrectNetwork: boolean
  balances?: {
    eth?: string
    usdc?: string
  }
  lastUpdated?: string
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.wallet_address) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 401 })
    }

    const state = await kv.get<WalletState>(`${WALLET_KEY_PREFIX}${session.user.wallet_address}`)
    return NextResponse.json(state)
  } catch (error) {
    console.error('Failed to get wallet state:', error)
    return NextResponse.json(
      { error: 'Failed to get wallet state' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.wallet_address) {
      return NextResponse.json({ error: 'No wallet address found' }, { status: 401 })
    }

    const state = await request.json()
    await kv.set(`${WALLET_KEY_PREFIX}${session.user.wallet_address}`, JSON.stringify(state))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update wallet state:', error)
    return NextResponse.json(
      { error: 'Failed to update wallet state' },
      { status: 500 }
    )
  }
} 