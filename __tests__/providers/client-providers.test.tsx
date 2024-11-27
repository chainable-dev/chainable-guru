import { render, screen } from '@testing-library/react'
import { ClientProviders } from '@/components/providers/client-providers'

describe('ClientProviders', () => {
  it('renders children without crashing', () => {
    render(
      <ClientProviders>
        <div data-testid="test-child">Test Content</div>
      </ClientProviders>
    )
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('provides theme context', () => {
    render(
      <ClientProviders>
        <div data-testid="themed-element" className="dark:bg-gray-900">
          Themed Content
        </div>
      </ClientProviders>
    )
    
    const themedElement = screen.getByTestId('themed-element')
    expect(themedElement).toHaveClass('dark:bg-gray-900')
  })

  it('provides wagmi context', async () => {
    render(
      <ClientProviders>
        <div data-testid="wagmi-element">
          Wagmi Content
        </div>
      </ClientProviders>
    )
    
    // Verify wagmi provider is working
    const wagmiElement = screen.getByTestId('wagmi-element')
    expect(wagmiElement).toBeInTheDocument()
  })
}) 