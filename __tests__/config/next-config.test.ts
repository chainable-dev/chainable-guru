import { describe, it, expect } from 'vitest'
import path from 'path'

describe('Next.js Configuration', () => {
  const nextConfig = require(path.join(process.cwd(), 'next.config.js'))

  it('has required compiler options', () => {
    expect(nextConfig).toHaveProperty('compiler')
    if (nextConfig.compiler) {
      expect(nextConfig.compiler).toHaveProperty('styledComponents')
    }
  })

  it('has proper image configuration', () => {
    expect(nextConfig).toHaveProperty('images')
    if (nextConfig.images) {
      expect(nextConfig.images).toHaveProperty('domains')
      expect(Array.isArray(nextConfig.images.domains)).toBe(true)
    }
  })

  it('has typescript enabled', () => {
    const tsConfig = require(path.join(process.cwd(), 'tsconfig.json'))
    expect(tsConfig).toBeDefined()
    expect(tsConfig.compilerOptions.strict).toBe(true)
  })
}) 