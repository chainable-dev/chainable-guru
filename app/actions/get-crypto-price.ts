"use server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

export async function getCryptoPrice() {
  try {
    // Get current price data
    const currentData = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=2`
    ).then(res => res.json());

    // Get historical data for the chart (7 days)
    const historicalData = await fetch(
      `${COINGECKO_API}/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=hourly`
    ).then(res => res.json());

    const priceHistory = historicalData.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price
    }));

    return {
      current_price: currentData.bitcoin.usd,
      price_change_24h: currentData.bitcoin.usd_24h_change,
      price_change_percentage_24h: currentData.bitcoin.usd_24h_change,
      market_cap: currentData.bitcoin.usd_market_cap,
      total_volume: currentData.bitcoin.usd_24h_vol,
      high_24h: Math.max(...priceHistory.slice(-24).map((p: { price: number }) => p.price)),
      low_24h: Math.min(...priceHistory.slice(-24).map((p: { price: number }) => p.price)),
      price_history: priceHistory
    };
  } catch (error) {
    console.error("Failed to fetch crypto price:", error);
    throw new Error("Failed to fetch crypto price data");
  }
} 