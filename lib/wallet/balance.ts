import { createPublicClient, http, formatEther } from 'viem'
import { base, baseSepolia } from 'viem/chains'

const mainnetClient = createPublicClient({
  chain: base,
  transport: http()
})

const sepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

export async function getWalletBalance(address: string, chainId: number) {
  const client = chainId === 8453 ? mainnetClient : sepoliaClient
  
  try {
    const balance = await client.getBalance({ address: address as `0x${string}` })
    return {
      value: balance,
      formatted: formatEther(balance),
      symbol: 'ETH'
    }
  } catch (error) {
    console.error('Error fetching balance:', error)
    throw error
  }
} 