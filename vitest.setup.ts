import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import chalk from 'chalk'

beforeAll(() => {
  console.log(chalk.cyan('\n🔍 Starting test suite setup...'))
  
  // Mock matchMedia
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
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock server-only modules
  vi.mock('server-only', () => ({}))
  vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn()
  }))

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error(
      chalk.red('\n❌ Unhandled Rejection at:'),
      promise,
      chalk.red('\nReason:'),
      reason
    )
  })
})

afterEach(() => {
  cleanup()
})

afterAll(() => {
  console.log(chalk.cyan('\n🏁 Test suite cleanup completed\n'))
})

// Global error handler
global.console.error = (...args) => {
  console.log(chalk.red('\n❌ Console Error:'))
  console.log(chalk.gray(args.join(' ')))
  console.log('\n')
} 