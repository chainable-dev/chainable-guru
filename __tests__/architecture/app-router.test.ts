import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Next.js App Router Architecture', () => {
  const appDir = path.join(process.cwd(), 'app')

  it('should not contain pages directory', () => {
    const hasPages = fs.existsSync(path.join(process.cwd(), 'pages'))
    expect(hasPages).toBe(false)
  })

  it('should have proper app directory structure', () => {
    const hasAppDir = fs.existsSync(appDir)
    expect(hasAppDir).toBe(true)

    // Check for required app subdirectories
    const requiredDirs = ['(auth)', '(chat)']
    requiredDirs.forEach(dir => {
      expect(fs.existsSync(path.join(appDir, dir))).toBe(true)
    })
  })

  it('should follow naming conventions', () => {
    const allFiles = getAllFiles(appDir)
    
    allFiles.forEach(file => {
      // Route groups should be in parentheses
      if (path.basename(path.dirname(file)).startsWith('(')) {
        expect(path.basename(path.dirname(file))).toMatch(/^\([a-z-]+\)$/)
      }

      // Page files should be page.tsx
      if (file.endsWith('page.tsx')) {
        expect(path.basename(file)).toBe('page.tsx')
      }

      // Layout files should be layout.tsx
      if (file.endsWith('layout.tsx')) {
        expect(path.basename(file)).toBe('layout.tsx')
      }
    })
  })

  it('should have proper route handlers', () => {
    const apiDir = path.join(appDir, '(chat)', 'api')
    expect(fs.existsSync(apiDir)).toBe(true)

    const routeFiles = fs.readdirSync(apiDir, { recursive: true })
    routeFiles.forEach(file => {
      if (file.toString().endsWith('route.ts')) {
        const routePath = path.join(apiDir, file.toString())
        const content = fs.readFileSync(routePath, 'utf8')
        // Check for proper exports
        expect(content).toMatch(/export (async )?function (GET|POST|PUT|DELETE)/)
      }
    })
  })
})

// Helper function to get all files recursively
function getAllFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir, { withFileTypes: true })

  items.forEach(item => {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      files.push(...getAllFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  })

  return files
} 