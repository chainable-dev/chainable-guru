import { renderHook } from '@testing-library/react'
import { useWalletState } from '@/hooks/useWalletState'
import { useAccount, useBalance, useChainId, useWalletClient } from 'wagmi'

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useBalance: jest.fn(),
  useChainId: jest.fn(),
  useWalletClient: jest.fn()
}))

describe('useWalletState', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should return correct wallet state when connected to Base Mainnet', () => {
    // Mock hook returns
    ;(useAccount as jest.Mock).mockReturnValue({
      address: '0x123' as `0x${string}`,
      isConnected: true
    })
    ;(useChainId as jest.Mock).mockReturnValue(8453) // Base Mainnet
    ;(useWalletClient as jest.Mock).mockReturnValue({ data: {} })
    ;(useBalance as jest.Mock).mockReturnValue({
      data: {
        formatted: '1.5',
        symbol: 'ETH'
      },
      isLoading: false,
      isError: false
    })

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

  it('should return correct wallet state when connected to Base Sepolia', () => {
    ;(useAccount as jest.Mock).mockReturnValue({
      address: '0x456' as `0x${string}`,
      isConnected: true
    })
    ;(useChainId as jest.Mock).mockReturnValue(84532) // Base Sepolia
    ;(useWalletClient as jest.Mock).mockReturnValue({ data: {} })
    ;(useBalance as jest.Mock).mockReturnValue({
      data: {
        formatted: '0.5',
        symbol: 'ETH'
      },
      isLoading: false,
      isError: false
    })

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
    ;(useAccount as jest.Mock).mockReturnValue({
      address: undefined,
      isConnected: false
    })
    ;(useChainId as jest.Mock).mockReturnValue(1) // Wrong network
    ;(useWalletClient as jest.Mock).mockReturnValue({ data: null })
    ;(useBalance as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    })

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