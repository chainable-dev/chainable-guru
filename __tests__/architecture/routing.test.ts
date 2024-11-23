import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

describe('Routing Structure', () => {
  const appDir = path.join(process.cwd(), 'app')

  it('has required route groups', () => {
    const routeGroups = ['(auth)', '(chat)']
    routeGroups.forEach(group => {
      const exists = fs.existsSync(path.join(appDir, group))
      expect(exists).toBe(true)
    })
  })

  it('has required layout files', () => {
    const layouts = [
      'layout.tsx',
      '(auth)/layout.tsx',
      '(chat)/layout.tsx'
    ]
    layouts.forEach(layout => {
      const exists = fs.existsSync(path.join(appDir, layout))
      expect(exists).toBe(true)
    })
  })

  it('has valid route structure', () => {
    // Check (chat) directory structure
    const chatDir = path.join(appDir, '(chat)')
    expect(fs.existsSync(chatDir)).toBe(true)
    
    // Check for specific required files/folders
    const requiredPaths = [
      'api',
      'chat',
      'layout.tsx'
    ]
    
    requiredPaths.forEach(path => {
      expect(fs.existsSync(path.join(chatDir, path))).toBe(true)
    })
  })
}) 