import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn()
  })
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn()
  })
}))

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
}) 