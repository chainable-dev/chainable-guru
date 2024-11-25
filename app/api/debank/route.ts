import { NextRequest, NextResponse } from 'next/server'

const DEBANK_API_KEY = process.env.DEBANK_API_KEY
const DEBANK_API_URL = 'https://pro-openapi.debank.com/v1'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const address = searchParams.get('address')
    const type = searchParams.get('type') || 'balances'

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const endpoint = type === 'tokens' ? '/token_list' : '/user/total_balance'
    const response = await fetch(`${DEBANK_API_URL}${endpoint}?address=${address}`, {
      headers: {
        'AccessKey': DEBANK_API_KEY!,
        'accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch from Debank API')
    }

    const data = await response.json()
    return NextResponse.json({ 
      [type]: data,
      timestamp: Date.now() 
    })
  } catch (error) {
    console.error('Debank API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from Debank' },
      { status: 500 }
    )
  }
} 