import { NextResponse } from "next/server";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia, base } from "viem/chains";

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

export async function GET(request: Request) {
  try {
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

    // Get ETH balance
    const balance = await client.getBalance({ address: address as `0x${string}` });
    
    // Format the balance
    const formattedBalance = formatEther(balance);

    return NextResponse.json({
      address,
      network,
      balance: formattedBalance,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet balance" },
      { status: 500 }
    );
  }
} 