import { kv } from '@vercel/kv';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const RATE_LIMIT = {
  WINDOW_MS: 60000, // 1 minute
  MAX_REQUESTS: 30, // Maximum requests per minute (Free tier limit)
};

interface CoinGeckoPrice {
  [key: string]: {
    [currency: string]: number;
  };
}

interface CoinGeckoMarketChart {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface CoinGeckoSearchResult {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

async function checkRateLimit(identifier: string): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.WINDOW_MS;
  
  const usage = await kv.get<{ requests: number; timestamp: number }>(
    `ratelimit:coingecko:${identifier}`
  ) || { requests: 0, timestamp: now };

  if (usage.timestamp < windowStart) {
    usage.requests = 0;
    usage.timestamp = now;
  }

  if (usage.requests >= RATE_LIMIT.MAX_REQUESTS) {
    return false;
  }

  usage.requests++;
  await kv.set(`ratelimit:coingecko:${identifier}`, usage, { ex: 60 });
  return true;
}

export async function getCoinPrice(coinId: string, currency: string = 'usd'): Promise<number> {
  const canMakeRequest = await checkRateLimit('price');
  if (!canMakeRequest) {
    throw new Error('Rate limit exceeded for CoinGecko API');
  }

  const response = await fetch(
    `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=${currency}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch coin price');
  }

  const data: CoinGeckoPrice = await response.json();
  return data[coinId][currency];
}

export async function getCoinMarketChart(
  coinId: string,
  currency: string = 'usd',
  days: number = 7
): Promise<CoinGeckoMarketChart> {
  const canMakeRequest = await checkRateLimit('chart');
  if (!canMakeRequest) {
    throw new Error('Rate limit exceeded for CoinGecko API');
  }

  const response = await fetch(
    `${COINGECKO_API_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch market chart');
  }

  return response.json();
}

export async function searchCoins(query: string): Promise<CoinGeckoSearchResult[]> {
  const canMakeRequest = await checkRateLimit('search');
  if (!canMakeRequest) {
    throw new Error('Rate limit exceeded for CoinGecko API');
  }

  const response = await fetch(
    `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Failed to search coins');
  }

  const data = await response.json();
  return data.coins;
} 