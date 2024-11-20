import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Next.js App Router Structure', () => {
  const projectRoot = process.cwd()

  // Helper function to check file naming conventions
  const checkFileNamingConventions = (filePath: string): string[] => {
    const violations: string[] = []
    const fileName = path.basename(filePath)
    
    // Only check for critical violations
    if (filePath.includes('/api/') && fileName !== 'route.ts') {
      violations.push(`API route ${filePath} should be named 'route.ts'`)
    }

    return violations
  }

  it('follows file naming conventions', () => {
    const walkDir = (dir: string): string[] => {
      const violations: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      // Skip these directories
      const excludedDirs = [
        'node_modules',
        '.next',
        '.git',
        'dist',
        'build',
        'coverage',
        'components'  // Temporarily skip components directory
      ]
      
      if (excludedDirs.some(excluded => dir.includes(excluded))) {
        return violations
      }
      
      list.forEach(file => {
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory()) {
          violations.push(...walkDir(fullPath))
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
          violations.push(...checkFileNamingConventions(fullPath))
        }
      })
      
      return violations
    }

    const violations = walkDir(projectRoot)
    if (violations.length > 0) {
      console.log('File naming convention violations:')
      violations.forEach(v => console.log('-', v))
    }
    expect(violations).toHaveLength(0)
  })

  it('does not use pages directory', () => {
    const pagesExists = fs.existsSync(path.join(projectRoot, 'pages'))
    expect(pagesExists).toBe(false)
  })

  it('does not have duplicate src folders', () => {
    const dirs = fs.readdirSync(projectRoot, { withFileTypes: true })
    const srcFolders = dirs
      .filter(dir => dir.isDirectory())
      .filter(dir => dir.name.toLowerCase().includes('src'))
    
    expect(srcFolders.length).toBe(1)
    expect(srcFolders[0].name).toBe('src')
  })

  it('does not have nested src folders except in allowed locations', () => {
    const walkDir = (dir: string): string[] => {
      const results: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      // Skip these directories
      const excludedDirs = [
        'node_modules',
        '.next',
        '.git',
        'dist',
        'build',
        'coverage'
      ]
      
      if (excludedDirs.some(excluded => dir.includes(excluded))) {
        return results
      }
      
      list.forEach(file => {
        if (file.isDirectory()) {
          if (file.name.toLowerCase().includes('src') && dir !== projectRoot) {
            // Allow src in specific cases
            const relativePath = path.relative(projectRoot, dir)
            const isAllowedPath = [
              'examples',
              'templates',
              'docs'
            ].some(allowed => relativePath.includes(allowed))
            
            if (!isAllowedPath) {
              results.push(path.join(dir, file.name))
            }
          }
          results.push(...walkDir(path.join(dir, file.name)))
        }
      })
      
      return results
    }

    const nestedSrcFolders = walkDir(projectRoot)
    expect(nestedSrcFolders).toHaveLength(0)
  })

  it('does not have duplicate component files', () => {
    const componentsDir = path.join(projectRoot, 'src', 'components')
    if (!fs.existsSync(componentsDir)) return

    const getFileBasenames = (files: string[]): string[] => {
      return files.map(file => path.basename(file, path.extname(file)))
    }

    const walkDir = (dir: string): string[] => {
      const results: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      list.forEach(file => {
        if (file.isDirectory()) {
          results.push(...walkDir(path.join(dir, file.name)))
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
          results.push(path.join(dir, file.name))
        }
      })
      
      return results
    }

    const componentFiles = walkDir(componentsDir)
    const basenames = getFileBasenames(componentFiles)
    const uniqueBasenames = new Set(basenames)

    expect(basenames.length).toBe(uniqueBasenames.size)
  })

  it('has correct file extensions', () => {
    const walkDir = (dir: string): string[] => {
      const results: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      // Skip node_modules and other build directories
      if (dir.includes('node_modules') || 
          dir.includes('.next') || 
          dir.includes('dist') ||
          dir.includes('build')) {
        return results
      }
      
      list.forEach(file => {
        if (file.isDirectory()) {
          results.push(...walkDir(path.join(dir, file.name)))
        } else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
          results.push(path.join(dir, file.name))
        }
      })
      
      return results
    }

    const jsFiles = walkDir(path.join(projectRoot, 'src'))
    expect(jsFiles).toHaveLength(0)
  })

  it('has correct hook naming patterns', () => {
    const walkDir = (dir: string): string[] => {
      const results: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      list.forEach(file => {
        if (file.isDirectory()) {
          results.push(...walkDir(path.join(dir, file.name)))
        } else if (
          (file.name.includes('hook') || file.name.includes('use')) &&
          !file.name.startsWith('use')
        ) {
          results.push(path.join(dir, file.name))
        }
      })
      
      return results
    }

    const incorrectlyNamedHooks = walkDir(path.join(projectRoot, 'src'))
    expect(incorrectlyNamedHooks).toHaveLength(0)
  })

  it('follows component naming conventions', () => {
    const componentsDir = path.join(projectRoot, 'src', 'components')
    if (!fs.existsSync(componentsDir)) return

    const walkDir = (dir: string): string[] => {
      const results: string[] = []
      const list = fs.readdirSync(dir, { withFileTypes: true })
      
      list.forEach(file => {
        if (file.isDirectory()) {
          results.push(...walkDir(path.join(dir, file.name)))
        } else if (
          (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) &&
          file.name[0] !== file.name[0].toUpperCase()
        ) {
          results.push(path.join(dir, file.name))
        }
      })
      
      return results
    }

    const incorrectlyNamedComponents = walkDir(componentsDir)
    expect(incorrectlyNamedComponents).toHaveLength(0)
  })
}) 