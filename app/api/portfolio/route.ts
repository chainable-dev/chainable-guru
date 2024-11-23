import { NextResponse } from 'next/server'

const DEBANK_API_KEY = process.env.DEBANK_API_KEY
const DEBANK_API_URL = 'https://pro-openapi.debank.com/v1'

// Default addresses for testing
const DEFAULT_ADDRESSES = {
  vitalik: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  base_whale: '0x000000000000000000000000000000000000dEaD',
}

// Supported chains
const SUPPORTED_CHAINS = {
  base: 'base',
  optimism: 'op',
  arbitrum: 'arb',
  ethereum: 'eth',
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address') || DEFAULT_ADDRESSES.vitalik
    const chainId = searchParams.get('chain_id')
    const view = searchParams.get('view') || 'total'

    const endpoint = chainId 
      ? `${DEBANK_API_URL}/user/token_list?id=${address}&chain_id=${chainId}`
      : `${DEBANK_API_URL}/user/total_balance?id=${address}`

    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'AccessKey': DEBANK_API_KEY || ''
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from DeBank API')
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch portfolio data',
        defaults: {
          addresses: DEFAULT_ADDRESSES,
          chains: SUPPORTED_CHAINS
        }
      },
      { status: 500 }
    )
  }
} 