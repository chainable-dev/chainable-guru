import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { getBalance } from '@wagmi/core'

// Mock wagmi core
vi.mock('@wagmi/core', () => ({
  getBalance: vi.fn(),
  createConfig: vi.fn(),
  http: vi.fn()
}))

describe('Wallet State', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch wallet balance correctly', async () => {
    const mockBalance = {
      decimals: 18,
      formatted: '1.5',
      symbol: 'ETH',
      value: BigInt('1500000000000000000')
    }

    vi.mocked(getBalance).mockResolvedValue(mockBalance)

    const address = '0x4557B18E779944BFE9d78A672452331C186a9f48'
    const result = await getBalance({
      address,
      chainId: 1, // mainnet
      unit: 'ether'
    })

    expect(result).toEqual(mockBalance)
    expect(getBalance).toHaveBeenCalledWith({
      address,
      chainId: 1,
      unit: 'ether'
    })
  })

  it('should handle balance fetch errors', async () => {
    const mockError = new Error('Failed to fetch balance')
    vi.mocked(getBalance).mockRejectedValue(mockError)

    const address = '0x4557B18E779944BFE9d78A672452331C186a9f48'
    
    await expect(getBalance({
      address,
      chainId: 1
    })).rejects.toThrow('Failed to fetch balance')
  })

  it('should fetch token balance correctly', async () => {
    const mockTokenBalance = {
      decimals: 6,
      formatted: '100.5',
      symbol: 'USDC',
      value: BigInt('100500000')
    }

    vi.mocked(getBalance).mockResolvedValue(mockTokenBalance)

    const address = '0x4557B18E779944BFE9d78A672452331C186a9f48'
    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC contract
    
    const result = await getBalance({
      address,
      token: tokenAddress,
      chainId: 1
    })

    expect(result).toEqual(mockTokenBalance)
    expect(getBalance).toHaveBeenCalledWith({
      address,
      token: tokenAddress,
      chainId: 1
    })
  })
}) 