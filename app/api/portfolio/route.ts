import { NextResponse } from 'next/server'
import { DeBankService } from '@/lib/services/debank-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chainId = searchParams.get('chainId')

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    const debankService = DeBankService.getInstance()
    
    if (chainId) {
      const tokenBalances = await debankService.getTokenBalances(address, chainId)
      return NextResponse.json(tokenBalances)
    }

    const portfolio = await debankService.getPortfolio(address)
    return NextResponse.json(portfolio)

  } catch (error) {
    console.error('Portfolio API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    )
  }
} 