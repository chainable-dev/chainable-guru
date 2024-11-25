import { Cdp, Wallet } from 'cdp'

// Type for network IDs
export type NetworkId = 'base-mainnet' | 'base-sepolia'

// Configuration interface
interface CdpConfig {
  apiKey: string
  apiKeyName: string
  apiKeyPrivateKey: string
  networks: {
    mainnet: {
      rpc: string
      chainId: number
      usdcAddress: string
    }
    sepolia: {
      rpc: string
      chainId: number
      usdcAddress: string
    }
  }
}

// CDP configuration using environment variables
const cdpConfig: CdpConfig = {
  apiKey: process.env.NEXT_PUBLIC_CDP_API_KEY!,
  apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME!,
  apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY!,
  networks: {
    mainnet: {
      rpc: process.env.NEXT_PUBLIC_BASE_MAINNET_RPC!,
      chainId: Number(process.env.NEXT_PUBLIC_BASE_MAINNET_CHAIN_ID),
      usdcAddress: process.env.NEXT_PUBLIC_USDC_MAINNET!
    },
    sepolia: {
      rpc: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC!,
      chainId: Number(process.env.NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID),
      usdcAddress: process.env.NEXT_PUBLIC_USDC_SEPOLIA!
    }
  }
}

// CDP client class
export class CdpClient {
  private static instance: CdpClient
  private wallet: Wallet | null = null

  private constructor() {
    // Configure CDP with API credentials
    Cdp.configure(cdpConfig.apiKeyName, cdpConfig.apiKeyPrivateKey)
  }

  public static getInstance(): CdpClient {
    if (!CdpClient.instance) {
      CdpClient.instance = new CdpClient()
    }
    return CdpClient.instance
  }

  // Create or get wallet
  public async getWallet(networkId: NetworkId = 'base-sepolia'): Promise<Wallet> {
    if (!this.wallet) {
      this.wallet = await Wallet.create(networkId)
    }
    return this.wallet
  }

  // Get USDC address for network
  public getUsdcAddress(networkId: NetworkId): string {
    return networkId === 'base-mainnet' 
      ? cdpConfig.networks.mainnet.usdcAddress 
      : cdpConfig.networks.sepolia.usdcAddress
  }

  // Transfer tokens
  public async transfer(
    amount: number,
    assetId: string,
    destination: string,
    networkId: NetworkId = 'base-sepolia',
    gasless: boolean = false
  ) {
    const wallet = await this.getWallet(networkId)
    const transfer = await wallet.transfer(amount, assetId, destination, gasless)
    return transfer.wait()
  }

  // Get balance
  public async getBalance(
    assetId: string,
    networkId: NetworkId = 'base-sepolia'
  ) {
    const wallet = await this.getWallet(networkId)
    return wallet.balance(assetId)
  }

  // Get all balances
  public async getBalances(networkId: NetworkId = 'base-sepolia') {
    const wallet = await this.getWallet(networkId)
    return wallet.balances()
  }
}

// Export singleton instance
export const cdpClient = CdpClient.getInstance() 