import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders label element', () => {
    render(<Label>Test Label</Label>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Label className="custom">Test Label</Label>)
    expect(screen.getByText('Test Label')).toHaveClass('custom')
  })

  it('associates with form control', () => {
    render(
      <>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </>
    )
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(
      <div className="peer-disabled:opacity-70">
        <input disabled className="peer" />
        <Label>Test Label</Label>
      </div>
    )
    expect(screen.getByText('Test Label')).toHaveClass('peer-disabled:opacity-70')
  })

  it('maintains accessibility attributes', () => {
    render(<Label aria-label="accessible label">Test Label</Label>)
    expect(screen.getByText('Test Label')).toHaveAttribute('aria-label', 'accessible label')
  })
}) 