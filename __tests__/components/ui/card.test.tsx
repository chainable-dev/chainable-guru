import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders Card with content', () => {
    const { container } = render(
      <Card>
        <CardContent>Test Content</CardContent>
      </Card>
    )
    expect(container.firstChild).toHaveClass('rounded-lg border bg-card')
  })

  it('renders full Card structure', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>Test Content</CardContent>
      </Card>
    )
    
    expect(getByText('Test Title')).toBeInTheDocument()
    expect(getByText('Test Content')).toBeInTheDocument()
  })
}) 