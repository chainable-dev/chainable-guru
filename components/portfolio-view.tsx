'use client'

import { useDebank } from '@/hooks/use-debank'
import { useEffect, useState } from 'react'

interface PortfolioProps {
  address: string
}

export function PortfolioView({ address }: PortfolioProps) {
  const { getPortfolio, isLoading, error } = useDebank()
  const [portfolio, setPortfolio] = useState<any>(null)

  useEffect(() => {
    async function fetchPortfolio() {
      const data = await getPortfolio(address)
      setPortfolio(data)
    }
    
    if (address) {
      fetchPortfolio()
    }
  }, [address, getPortfolio])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!portfolio) return null

  return (
    <div>
      <h2>Portfolio Value: ${portfolio.totalValue.toFixed(2)}</h2>
      {/* Render balances and tokens */}
    </div>
  )
} 