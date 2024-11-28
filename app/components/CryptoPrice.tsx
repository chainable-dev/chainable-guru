import { Card } from "@/components/ui/card";
import { CryptoChart } from "./CryptoChart";
import Image from "next/image";

interface CryptoPriceProps {
  data: {
    symbol: string;
    name: string;
    price: number;
    currency: string;
    chartData: {
      timestamps: number[];
      prices: number[];
    };
    thumbnail: string;
    marketCapRank: number;
  };
}

export function CryptoPrice({ data }: CryptoPriceProps) {
  const { symbol, name, price, currency, chartData, thumbnail, marketCapRank } = data;

  return (
    <Card className="w-full p-4 grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={thumbnail}
            alt={`${name} logo`}
            width={32}
            height={32}
            className="rounded-full"
          />
          <div>
            <h3 className="text-2xl font-bold">{name} ({symbol})</h3>
            <div className="flex items-center gap-2">
              <p className="text-lg text-muted-foreground">
                {currency.toUpperCase()} {price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {marketCapRank && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  Rank #{marketCapRank}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            7-day price history
          </div>
        </div>
      </div>
      <CryptoChart 
        data={chartData}
        coinName={name}
        currency={currency}
      />
    </Card>
  );
} 