import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('input')).toBeDefined()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    const { container } = render(<Input onChange={handleChange} />)
    const input = container.querySelector('input')!
    
    fireEvent.change(input, { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalled()
  })
}) 