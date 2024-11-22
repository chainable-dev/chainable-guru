import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWalletState } from '@/hooks/useWalletState'
import { useAccount, useBalance, useChainId, useWalletClient } from 'wagmi'

vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
  useBalance: vi.fn(),
  useChainId: vi.fn(),
  useWalletClient: vi.fn()
}))

describe('useWalletState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return correct state for Base Mainnet', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x123' as `0x${string}`,
      isConnected: true
    } as any)
    
    vi.mocked(useChainId).mockReturnValue(8453) // Base Mainnet
    vi.mocked(useWalletClient).mockReturnValue({ data: {} } as any)
    vi.mocked(useBalance).mockReturnValue({
      data: {
        formatted: '1.5',
        symbol: 'ETH'
      },
      isLoading: false,
      isError: false
    } as any)

    const { result } = renderHook(() => useWalletState())

    expect(result.current).toEqual({
      address: '0x123',
      isConnected: true,
      chainId: 8453,
      balance: '1.5',
      balanceSymbol: 'ETH',
      isBalanceLoading: false,
      isBalanceError: false,
      networkInfo: {
        name: 'Base Mainnet',
        isTestnet: false
      },
      isCorrectNetwork: true,
      walletClient: {}
    })
  })

  it('should return correct state for Base Sepolia', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: '0x456' as `0x${string}`,
      isConnected: true
    } as any)
    
    vi.mocked(useChainId).mockReturnValue(84532) // Base Sepolia
    vi.mocked(useWalletClient).mockReturnValue({ data: {} } as any)
    vi.mocked(useBalance).mockReturnValue({
      data: {
        formatted: '0.5',
        symbol: 'ETH'
      },
      isLoading: false,
      isError: false
    } as any)

    const { result } = renderHook(() => useWalletState())

    expect(result.current).toEqual({
      address: '0x456',
      isConnected: true,
      chainId: 84532,
      balance: '0.5',
      balanceSymbol: 'ETH',
      isBalanceLoading: false,
      isBalanceError: false,
      networkInfo: {
        name: 'Base Sepolia',
        isTestnet: true
      },
      isCorrectNetwork: true,
      walletClient: {}
    })
  })

  it('should handle disconnected state', () => {
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      isConnected: false
    } as any)
    
    vi.mocked(useChainId).mockReturnValue(1) // Wrong network
    vi.mocked(useWalletClient).mockReturnValue({ data: null } as any)
    vi.mocked(useBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    } as any)

    const { result } = renderHook(() => useWalletState())

    expect(result.current).toEqual({
      address: undefined,
      isConnected: false,
      chainId: 1,
      balance: undefined,
      balanceSymbol: undefined,
      isBalanceLoading: false,
      isBalanceError: false,
      networkInfo: {
        name: 'Unknown Network',
        isTestnet: false
      },
      isCorrectNetwork: false,
      walletClient: null
    })
  })
}) 