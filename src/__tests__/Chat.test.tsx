import { render, screen, fireEvent } from '@testing-library/react'
import { Chat } from '@/components/custom/chat'
import { describe, expect, it, vi } from 'vitest'

describe('Chat Component', () => {
  it('renders chat interface', () => {
    render(<Chat />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(<Chat />)
    expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument()
  })
}) 