import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders default button', () => {
    const { container } = render(<Button>Click me</Button>)
    expect(container.firstChild).toBeDefined()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Button className="custom">Click me</Button>
    )
    expect(container.firstChild).toHaveClass('custom')
  })

  it('renders as button tag by default', () => {
    const { container } = render(<Button>Click me</Button>)
    expect(container.querySelector('button')).toBeDefined()
  })
}) 