import { render, fireEvent, screen, waitFor } from '@testing-library/react'
import { MultimodalInput } from '@/components/custom/multimodal-input'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

// Mock hooks
vi.mock('@/hooks/useWalletState', () => ({
  useWalletState: () => ({
    address: '0x123',
    isConnected: true,
    chainId: 8453,
    networkInfo: { name: 'Base' },
    isCorrectNetwork: true
  })
}))

// Mock localStorage hook
vi.mock('usehooks-ts', () => ({
  useLocalStorage: () => ['', vi.fn()],
  useWindowSize: () => ({ width: 1024, height: 768 })
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.txt' } }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
      })
    }
  })
}))

// Mock suggested actions
const mockSuggestedActions = [
  {
    title: 'Create a new document',
    label: 'with the title "My New Document"',
    action: 'Create a new document with the title "My New Document"',
  },
  {
    title: 'Check wallet balance',
    label: 'for my connected wallet',
    action: 'Check the balance of my connected wallet',
  }
]

describe('MultimodalInput', () => {
  const mockProps = {
    input: '',
    setInput: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
    attachments: [],
    setAttachments: vi.fn(),
    messages: [],
    setMessages: vi.fn(),
    append: vi.fn(),
    handleSubmit: vi.fn(),
    chatId: '123',
    className: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = vi.fn(() => 'blob:test')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('renders suggested actions correctly', () => {
    render(<MultimodalInput {...mockProps} />)
    mockSuggestedActions.forEach(action => {
      expect(screen.getByText(action.title)).toBeInTheDocument()
      expect(screen.getByText(action.label)).toBeInTheDocument()
    })
  })

  it('handles text input and adjusts height', async () => {
    render(<MultimodalInput {...mockProps} />)
    const textarea = screen.getByRole('textbox')
    
    await userEvent.type(textarea, 'Test message')
    expect(mockProps.setInput).toHaveBeenCalledWith('Test message')
    expect(textarea).toHaveStyle({ height: 'auto' })
  })

  it('handles file uploads with progress', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })
    render(<MultimodalInput {...mockProps} />)
    
    const input = screen.getByTestId('file-input')
    await act(async () => {
      await fireEvent.change(input, { target: { files: [file] } })
    })

    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument()
    })
  })

  it('handles paste events with images', async () => {
    render(<MultimodalInput {...mockProps} />)
    const textarea = screen.getByRole('textbox')
    
    const imageBlob = new Blob(['fake-image'], { type: 'image/png' })
    const clipboardData = {
      files: [imageBlob],
      getData: () => '',
      items: [{
        kind: 'file',
        type: 'image/png',
        getAsFile: () => new File([imageBlob], 'pasted-image.png', { type: 'image/png' })
      }]
    }

    await act(async () => {
      fireEvent.paste(textarea, { clipboardData })
    })

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled()
    })
  })

  it('handles wallet-related queries correctly', async () => {
    const { rerender } = render(<MultimodalInput {...mockProps} />)
    const textarea = screen.getByRole('textbox')
    
    await userEvent.type(textarea, 'check wallet balance')
    await userEvent.keyboard('{Enter}')

    expect(mockProps.append).toHaveBeenCalledWith(
      expect.objectContaining({
        role: 'user',
        content: expect.stringContaining('walletAddress')
      }),
      expect.any(Object)
    )

    // Test disconnected wallet
    vi.mocked(useWalletState).mockImplementationOnce(() => ({
      address: '',
      isConnected: false,
      chainId: undefined,
      networkInfo: undefined,
      isCorrectNetwork: false
    }))

    rerender(<MultimodalInput {...mockProps} />)
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'check wallet balance')
    await userEvent.keyboard('{Enter}')

    expect(screen.getByText('Please connect your wallet first')).toBeInTheDocument()
  })

  it('cleans up resources properly', () => {
    const { unmount } = render(<MultimodalInput {...mockProps} />)
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalled()
  })

  it('handles loading state correctly', () => {
    render(<MultimodalInput {...mockProps} isLoading={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByTestId('stop-icon')).toBeInTheDocument()
  })
}) 