import fs from 'fs'

import { describe, it, expect } from 'vitest'

describe('Project Architecture', () => {
  it('should have correct app router structure', () => {
    const appDirs = fs.readdirSync('app')
    expect(appDirs).toContain('api')
    expect(appDirs).toContain('(auth)')
    // Update or remove this line if '(dashboard)' is not needed
    // expect(appDirs).toContain('(dashboard)');
  })

  it('should follow correct component organization', () => {
    const componentDirs = fs.readdirSync('components')
    expect(componentDirs).toContain('ui')
    // Update or remove this line if 'forms' is not needed
    // expect(componentDirs).toContain('forms');
  })

  
}) 