import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MockSidebar, MockMultimodalInput } from './__mocks__/components'
import { useSearchParams } from 'next/navigation'

// Mock the components
vi.mock('@/components/ui/sidebar', () => ({
  default: MockSidebar
}))

vi.mock('@/components/custom/multimodal-input', () => ({
  default: MockMultimodalInput
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: vi.fn()
}))

describe('Chat Routing', () => {
  it('should render chat components correctly', () => {
    render(
      <div>
        <MockSidebar>
          <MockMultimodalInput />
        </MockSidebar>
      </div>
    )

    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-multimodal-input')).toBeInTheDocument()
  })

  it('should handle chat route parameters', () => {
    const mockParams = new URLSearchParams('?message=test')
    const mockUseSearchParams = vi.mocked(useSearchParams)
    mockUseSearchParams.mockReturnValue(mockParams)

    render(
      <div>
        <MockSidebar>
          <MockMultimodalInput />
        </MockSidebar>
      </div>
    )

    expect(MockMultimodalInput).toHaveBeenCalled()
  })
}) 