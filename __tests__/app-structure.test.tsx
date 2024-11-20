import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Next.js App Router Structure', () => {
  const projectRoot = process.cwd()

  it('does not use pages directory', () => {
    const pagesExists = fs.existsSync(path.join(projectRoot, 'pages'))
    expect(pagesExists).toBe(false)
  })
}) 