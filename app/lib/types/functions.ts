export interface WeatherParams {
  location: string;
  unit?: 'celsius' | 'fahrenheit';
}

export interface CryptoPriceParams {
  symbol: string;
  currency?: 'USD' | 'EUR' | 'GBP';
}

export interface FunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 