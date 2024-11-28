export interface PriceDataPoint {
  timestamp: string;
  price: number;
}

export interface CryptoPrice {
  symbol: string;
  price: number;
  timestamp: string;
  change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  last_updated?: string;
  historical_data?: PriceDataPoint[];
}

export interface CryptoPriceResponse {
  success: boolean;
  data: CryptoPrice;
  error?: string;
} 