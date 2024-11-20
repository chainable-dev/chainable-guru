import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'
import chalk from 'chalk'

// Enhanced error handling
beforeAll(() => {
  console.log(chalk.cyan('\n🔍 Starting test suite setup...'))
  
  // Add custom error formatter
  Error.stackTraceLimit = 3
  
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

// Cleanup after each test
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