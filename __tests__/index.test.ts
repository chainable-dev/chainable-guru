import './app/layout.test'
import './app/error-handling.test'
import './app/data-fetching.test'
import './app/routing.test'
import './app/(chat)/layout.test'
import './architecture/file-structure.test'
import './components/Chat/ChatMessage.test'
import './hooks/useChat.test'
import './api/chat/route.test'
import './utils/validation.test'
import './middleware.test'

describe('Full Test Suite', () => {
  it('should run all tests', () => {
    expect(true).toBe(true)
  })
}) 