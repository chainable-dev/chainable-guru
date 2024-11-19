import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  // Example of React component test
  it('renders hello world', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
}) 