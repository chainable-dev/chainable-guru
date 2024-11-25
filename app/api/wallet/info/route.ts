import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia, base } from "viem/chains";
import { rateLimit } from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Initialize public clients for different networks
const clients = {
  "base-sepolia": createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }),
  "base": createPublicClient({
    chain: base,
    transport: http(),
  }),
};

async function fetchTokenBalances(address: string) {
  const DEBANK_API_KEY = process.env.DEBANK_API_KEY;
  const DEBANK_BASE_URL = "https://pro-openapi.debank.com/v1";

  try {
    const response = await fetch(
      `${DEBANK_BASE_URL}/user/token_list?id=${address}`,
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': DEBANK_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('DeBankAPI request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('DeBankAPI error:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    await limiter.check(request, 10);

    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const network = searchParams.get("network") || "base-sepolia";

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const client = clients[network as keyof typeof clients];
    if (!client) {
      return NextResponse.json(
        { error: "Invalid network specified" },
        { status: 400 }
      );
    }

    // Fetch data in parallel
    const [balance, tokens] = await Promise.all([
      client.getBalance({ address: address as `0x${string}` }),
      fetchTokenBalances(address),
    ]);

    // Format the response
    const formattedBalance = formatEther(balance);
    const formattedTokens = tokens.map((token: any) => ({
      chain: token.chain,
      symbol: token.symbol,
      balance: token.balance,
      price: token.price,
      usd_value: token.amount * token.price,
    }));

    return NextResponse.json({
      address,
      network,
      nativeBalance: {
        amount: formattedBalance,
        symbol: network.includes('sepolia') ? 'SEP-ETH' : 'ETH',
      },
      tokens: formattedTokens,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Wallet info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet information" },
      { status: 500 }
    );
  }
} 