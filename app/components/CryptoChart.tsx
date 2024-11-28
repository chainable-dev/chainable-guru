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
  ChartOptions
} from 'chart.js';
import { useTheme } from 'next-themes';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoChartProps {
  data: {
    timestamps: number[];
    prices: number[];
  };
  coinName: string;
  currency: string;
}

export function CryptoChart({ data, coinName, currency }: CryptoChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.timestamps.map(ts => new Date(ts).toLocaleDateString()),
    datasets: [
      {
        label: `${coinName} Price`,
        data: data.prices,
        borderColor: isDark ? '#10b981' : '#059669',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      title: {
        display: true,
        text: `${coinName} Price Chart (${currency.toUpperCase()})`,
        color: isDark ? '#e5e7eb' : '#374151',
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
          callback: (value) => `${currency.toUpperCase()} ${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 rounded-lg bg-background border border-border">
      <Line data={chartData} options={options} />
    </div>
  );
} 