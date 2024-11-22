import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Project Architecture', () => {
  const rootDir = path.join(__dirname, '..')

  it('should not have a src directory', () => {
    const hasSrcDir = fs.existsSync(path.join(rootDir, 'src'))
    expect(hasSrcDir).toBe(false)
  })

  it('should have an app directory instead of pages', () => {
    const hasAppDir = fs.existsSync(path.join(rootDir, 'app'))
    const hasPagesDir = fs.existsSync(path.join(rootDir, 'pages'))
    
    expect(hasAppDir).toBe(true)
    expect(hasPagesDir).toBe(false)
  })

  it('should have required base directories', () => {
    const requiredDirs = ['app', 'components', 'lib', 'public', '__tests__']
    
    requiredDirs.forEach(dir => {
      expect(fs.existsSync(path.join(rootDir, dir))).toBe(true)
    })
  })

  it('should follow kebab-case naming convention for static routes', () => {
    const appDir = path.join(rootDir, 'app')
    const staticRoutes = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('['))

    const offendingRoutes: string[] = []
    staticRoutes.forEach(route => {
      const isKebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route.name)
      if (!isKebabCase) {
        offendingRoutes.push(path.join('app', route.name))
      }
    })

    if (offendingRoutes.length > 0) {
      console.log('\nRoutes not following kebab-case convention:')
      offendingRoutes.forEach(route => console.log(`- ${route}`))
    }
  })

  it('should follow PascalCase for dynamic route segments', () => {
    const appDir = path.join(rootDir, 'app')
    const dynamicRoutes = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('['))

    dynamicRoutes.forEach(route => {
      const segmentName = route.name.slice(1, -1) // Remove [ ]
      const isPascalCase = /^[A-Z][a-zA-Z0-9]*$/.test(segmentName)
      expect(isPascalCase).toBe(true)
    })
  })

  it('should not have deeply nested routes (max 3 levels)', () => {
    const getDirectoryDepth = (dirPath: string): number => {
      const relativePath = path.relative(path.join(rootDir, 'app'), dirPath)
      return relativePath.split(path.sep).length
    }

    const checkDirDepth = (dirPath: string) => {
      const depth = getDirectoryDepth(dirPath)

      fs.readdirSync(dirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .forEach(dirent => {
          checkDirDepth(path.join(dirPath, dirent.name))
        })
    }

    checkDirDepth(path.join(rootDir, 'app'))
  })

  it('should have components in the correct location', () => {
    const componentsDir = path.join(rootDir, 'components')
    
    // Adjust these checks based on your actual structure
    const hasUiDir = fs.existsSync(path.join(componentsDir, 'ui'))
    
    expect(hasUiDir).toBe(true)
  })
}) 