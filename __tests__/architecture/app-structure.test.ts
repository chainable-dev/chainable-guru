import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Next.js App Architecture', () => {
  const rootDir = process.cwd()
  
  it('should have correct directory structure', () => {
    // Required directories
    expect(fs.existsSync(path.join(rootDir, 'app'))).toBe(true)
    expect(fs.existsSync(path.join(rootDir, 'components'))).toBe(true)
    expect(fs.existsSync(path.join(rootDir, 'lib'))).toBe(true)
    
    // Should not have pages directory
    expect(fs.existsSync(path.join(rootDir, 'pages'))).toBe(false)
  })

  it('should have required app route groups', () => {
    const appDir = path.join(rootDir, 'app')
    expect(fs.existsSync(path.join(appDir, '(auth)'))).toBe(true)
    expect(fs.existsSync(path.join(appDir, '(chat)'))).toBe(true)
  })

  it('should have proper file naming', () => {
    const appDir = path.join(rootDir, 'app')
    expect(fs.existsSync(path.join(appDir, 'layout.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(appDir, '(chat)/chat/[id]/page.tsx'))).toBe(true)
  })
}) 