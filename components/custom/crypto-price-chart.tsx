'use client';

import { format } from 'date-fns';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CryptoPrice } from '@/types/crypto';

interface CryptoPriceChartProps {
  data: CryptoPrice;
}

export function CryptoPriceChart({ data }: CryptoPriceChartProps) {
  // Create chart data with current price if no historical data
  const chartData = data.historical_data || [
    { timestamp: data.timestamp, price: data.price }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{data.symbol.toUpperCase()} Price</span>
          <span className="text-2xl">${data.price.toLocaleString()}</span>
        </CardTitle>
        {data.change_24h && (
          <span 
            className={`text-sm ${
              data.change_24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            24h Change: {data.change_24h.toFixed(2)}%
          </span>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(new Date(value), 'HH:mm')}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="font-medium">Price:</span>
                          <span>${Number(payload[0]?.value || 0).toLocaleString()}</span>
                          <span className="font-medium">Time:</span>
                          <span>{format(new Date(payload[0]?.payload?.timestamp), 'HH:mm:ss')}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Market Cap: </span>
            <span>${data.market_cap?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">24h Volume: </span>
            <span>${data.volume_24h?.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 