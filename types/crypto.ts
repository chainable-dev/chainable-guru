export interface CryptoPrice {
  symbol: string;
  price: number;
  timestamp: string;
  currency?: string;
  change_24h?: number;
  market_cap?: number;
  volume_24h?: number;
  last_updated?: string;
}

export interface CryptoPriceResponse {
  success: boolean;
  data: CryptoPrice;
  error?: string;
} 