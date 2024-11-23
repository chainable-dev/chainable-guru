import { NextResponse } from "next/server";

const DEBANK_API_KEY = process.env.DEBANK_API_KEY;
const DEBANK_BASE_URL = "https://pro-openapi.debank.com/v1";

// Helper function to fetch from DeBankAPI
async function fetchFromDeBank(endpoint: string, address: string) {
  try {
    const response = await fetch(`${DEBANK_BASE_URL}${endpoint}${address}`, {
      headers: {
        'Accept': 'application/json',
        'AccessKey': DEBANK_API_KEY || '',
      },
    });

    if (!response.ok) {
      throw new Error(`DeBankAPI error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('DeBankAPI fetch error:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!DEBANK_API_KEY) {
      return NextResponse.json(
        { error: "DeBankAPI key not configured" },
        { status: 500 }
      );
    }

    // Fetch basic wallet info
    const [totalBalance, tokens] = await Promise.all([
      fetchFromDeBank('/user/total_balance?id=', address),
      fetchFromDeBank('/user/token_list?id=', address),
    ]);

    return NextResponse.json({
      address,
      totalBalance: {
        total_usd_value: totalBalance?.total_usd_value || 0,
      },
      tokens: tokens?.map((token: any) => ({
        chain: token.chain,
        symbol: token.symbol,
        balance: token.balance,
        price: token.price,
        usd_value: token.amount * token.price,
      })) || [],
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("DeBankAPI error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet data from DeBankAPI" },
      { status: 500 }
    );
  }
} 