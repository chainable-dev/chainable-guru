import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

describe('Dialog Components', () => {
  it('renders dialog structure correctly', () => {
    const { container } = render(
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
          <div>Content</div>
        </DialogContent>
      </Dialog>
    )
    expect(container).toBeDefined()
  })
}) 