import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Project Architecture', () => {
  const rootDir = process.cwd()

  it('should follow correct folder structure', () => {
    const rootDirs = fs.readdirSync(rootDir).filter(
      f => fs.statSync(path.join(rootDir, f)).isDirectory()
    )
    
    expect(rootDirs).toContain('app')
    // expect(rootDirs).toContain('src')
    expect(rootDirs).not.toContain('pages') // No pages directory
  })

  it('should have correct app router structure', () => {
    const appDir = path.join(rootDir, 'app')
    const appDirs = fs.readdirSync(appDir)
    
    // Check for route groups
    expect(appDirs).toContain('api')

    // Verify correct file naming
    const routeFiles = getAllFiles(appDir)
    routeFiles.forEach(file => {
      const fileName = path.basename(file)
      // Next.js special files
      const specialFiles = [
        // Layout and page files
        'layout.tsx',
        'page.tsx',
        'loading.tsx',
        'error.tsx',
        'not-found.tsx',
        'default.tsx',
        'template.tsx',
        
        // Route handlers
        'route.ts',
        'actions.ts',
        
        // Metadata files
        'sitemap.ts',
        'robots.ts',
        'manifest.ts',
        
        // Image files
        'opengraph-image.png',
        'twitter-image.png',
        'icon.png',
        'apple-icon.png',
        'favicon.ico',
        
        // Other metadata
        'icon.tsx',
        'metadata.ts',
        'metadata.tsx'
      ]
      
      if (!specialFiles.includes(fileName)) {
        // Check if it's a directory name
        const isDirectory = fs.statSync(file).isDirectory()
        if (!isDirectory) {
          const ext = path.extname(fileName)
          // Handle different file types
          if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.mdx'].includes(ext)) {
            // Check kebab-case for code files
            expect(fileName).toMatch(/^[a-z0-9-]+\.[a-z]+$/)
          } else if (['.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'].includes(ext)) {
            // Check kebab-case for image files
            expect(fileName).toMatch(/^[a-z0-9-]+\.[a-z]+$/)
          }
        }
      }
    })
  })

  it('should follow correct component organization', () => {
    const componentsDir = path.join(rootDir, 'components')
    expect(fs.existsSync(componentsDir)).toBe(true)

    // Check component directory structure
    const componentDirs = fs.readdirSync(componentsDir)
    expect(componentDirs).toContain('ui') // shadcn components
  })

  it('should have correct API route structure', () => {
    const apiDir = path.join(rootDir, 'app/api')
    const apiRoutes = getAllFiles(apiDir)

    apiRoutes.forEach(route => {
      const routeFile = path.basename(route)
      if (!fs.statSync(route).isDirectory()) {
        expect(routeFile).toBe('route.ts')
      }
    })
  })

  it('should follow correct data fetching patterns', () => {
    const serverComponentFiles = getAllFiles(path.join(rootDir, 'app'))
      .filter(file => {
        // Only check .tsx files
        if (!file.endsWith('.tsx')) return false
        
        const content = fs.readFileSync(file, 'utf8')
        // Exclude files with 'use client' directive
        return !content.includes('use client')
      })
    
    serverComponentFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('useState')
      expect(content).not.toContain('useEffect')
    })
  })
})

// Helper function to recursively get all files
function getAllFiles(dir: string): string[] {
  const files: string[] = []
  
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath))
    } else {
      files.push(fullPath)
    }
  })
  
  return files
} 