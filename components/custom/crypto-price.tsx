"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceData {
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_history: {
    timestamp: string;
    price: number;
  }[];
}

export function CryptoPrice({ data }: { data: PriceData }) {
  const priceChangeIsPositive = data.price_change_24h >= 0;
  
  const chartData = {
    labels: data.price_history.map(point => 
      format(new Date(point.timestamp), "MMM d, HH:mm")
    ),
    datasets: [
      {
        label: 'BTC Price (USD)',
        data: data.price_history.map(point => point.price),
        borderColor: priceChangeIsPositive ? '#22c55e' : '#ef4444',
        backgroundColor: priceChangeIsPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const formatUSD = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);

  const formatLargeNumber = (value: number) =>
    new Intl.NumberFormat('en-US', { 
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);

  return (
    <div className="flex flex-col gap-4 rounded-xl p-6 bg-card text-card-foreground shadow-lg max-w-[600px]">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Bitcoin (BTC)</h2>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-semibold">
              {formatUSD(data.current_price)}
            </span>
            <span className={cn(
              "text-sm font-medium",
              priceChangeIsPositive ? "text-green-500" : "text-red-500"
            )}>
              {priceChangeIsPositive ? "+" : ""}
              {data.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end text-sm text-muted-foreground">
          <div>24h High: {formatUSD(data.high_24h)}</div>
          <div>24h Low: {formatUSD(data.low_24h)}</div>
        </div>
      </div>

      <div className="h-[200px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                }
              },
              y: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            }
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Market Cap</div>
          <div className="font-medium">{formatLargeNumber(data.market_cap)}</div>
        </div>
        <div>
          <div className="text-muted-foreground">24h Volume</div>
          <div className="font-medium">{formatLargeNumber(data.total_volume)}</div>
        </div>
      </div>
    </div>
  );
} 