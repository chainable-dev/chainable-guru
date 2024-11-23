'use client';

import cx from 'classnames';
import { formatNumber } from '@/lib/utils';

interface TokenBalance {
  symbol: string
  amount: number
  price: number
  usd_value: number
}

interface ChainData {
  id: string
  name: string
  native_token_id: string
  usd_value: number
  tokens: TokenBalance[]
}

interface DebankPortfolio {
  total_usd: number
  chain_list: ChainData[]
}

// Sample data similar to weather component
const SAMPLE_PORTFOLIO: DebankPortfolio = {
  total_usd: 15420.69,
  chain_list: [
    {
      id: "base",
      name: "Base",
      native_token_id: "eth",
      usd_value: 8250.33,
      tokens: [
        {
          symbol: "ETH",
          amount: 2.5,
          price: 2300.45,
          usd_value: 5751.125
        },
        {
          symbol: "USDC",
          amount: 2499.20,
          price: 1,
          usd_value: 2499.20
        }
      ]
    },
    {
      id: "op",
      name: "Optimism",
      native_token_id: "eth",
      usd_value: 7170.36,
      tokens: [
        {
          symbol: "OP",
          amount: 1500,
          price: 3.21,
          usd_value: 4815
        },
        {
          symbol: "ETH",
          amount: 1.023,
          price: 2300.45,
          usd_value: 2355.36
        }
      ]
    }
  ]
}

export function Portfolio({
  portfolio = SAMPLE_PORTFOLIO
}: {
  portfolio?: DebankPortfolio
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-purple-600 max-w-[500px]">
      {/* Total Value */}
      <div className="flex flex-row justify-between items-center">
        <div className="text-sm text-blue-100">Total Portfolio Value</div>
        <div className="text-2xl font-medium text-white">
          ${formatNumber(portfolio.total_usd)}
        </div>
      </div>

      {/* Chain List */}
      <div className="flex flex-col gap-3">
        {portfolio.chain_list.map((chain) => (
          <div 
            key={chain.id}
            className="bg-white/10 rounded-xl p-3 backdrop-blur-sm"
          >
            {/* Chain Header */}
            <div className="flex justify-between items-center mb-2">
              <div className="text-white font-medium">{chain.name}</div>
              <div className="text-blue-100">
                ${formatNumber(chain.usd_value)}
              </div>
            </div>

            {/* Token List */}
            <div className="flex flex-col gap-2">
              {chain.tokens.map((token) => (
                <div 
                  key={token.symbol}
                  className="flex justify-between items-center text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-white/20" /> {/* Token icon placeholder */}
                    <div className="text-white">
                      {formatNumber(token.amount)} {token.symbol}
                    </div>
                  </div>
                  <div className="text-blue-100">
                    ${formatNumber(token.usd_value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 