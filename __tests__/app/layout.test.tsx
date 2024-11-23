import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('Layout', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    )
    expect(container).toBeDefined()
  })
}) 