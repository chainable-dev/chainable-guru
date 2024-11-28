"use client";

import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

import { CryptoPrice } from '@/types/crypto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoPriceDisplayProps {
  data: CryptoPrice;
}

export function CryptoPriceDisplay({ data }: CryptoPriceDisplayProps) {
  const chartData: ChartData<'line'> = {
    labels: [format(new Date(data.timestamp), 'HH:mm:ss')],
    datasets: [
      {
        label: `${data.symbol.toUpperCase()} Price`,
        data: [data.price],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${data.symbol.toUpperCase()} Price Chart`
      }
    }
  };

  return (
    <div className="w-full p-4 rounded-lg bg-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {data.symbol.toUpperCase()} Price: ${data.price.toFixed(2)}
        </h3>
        {data.change_24h && (
          <p className={`text-sm ${data.change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            24h Change: {data.change_24h.toFixed(2)}%
          </p>
        )}
      </div>
      <div className="h-[300px]">
        <Line options={options} data={chartData} />
      </div>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Market Cap: ${data.market_cap?.toLocaleString()}</p>
        <p>24h Volume: ${data.volume_24h?.toLocaleString()}</p>
        <p>Last Updated: {format(new Date(data.last_updated || data.timestamp), 'PPpp')}</p>
      </div>
    </div>
  );
} 