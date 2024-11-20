// Built-in modules
import { TextEncoder, TextDecoder } from 'util'

// Testing libraries
import '@testing-library/jest-dom'
import '@testing-library/react'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Types
declare global {
  var TextEncoder: typeof TextEncoder
  var TextDecoder: typeof TextDecoder
}

// Setup global mocks
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder as any
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}))

vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => new Map()
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Add any additional setup code below 