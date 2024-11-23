import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

describe('Project Dependencies', () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
  )

  it('has required core dependencies', () => {
    const requiredDeps = [
      'next',
      'react',
      'react-dom',
      'typescript',
      '@types/react'
    ]

    requiredDeps.forEach(dep => {
      expect(
        packageJson.dependencies[dep] || packageJson.devDependencies[dep]
      ).toBeDefined()
    })
  })

  it('uses correct Next.js version', () => {
    const nextVersion = packageJson.dependencies.next
    expect(nextVersion.startsWith('14')).toBe(true)
  })
}) 