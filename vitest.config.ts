import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/app-structure.test.tsx'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
}) 