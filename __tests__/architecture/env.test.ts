import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

describe('Environment Configuration', () => {
  it('has required env files', () => {
    const envFiles = ['.env.example']
    envFiles.forEach(file => {
      expect(
        fs.existsSync(path.join(process.cwd(), file))
      ).toBe(true)
    })
  })

  it('env.example has required fields', () => {
    const envExample = fs.readFileSync(
      path.join(process.cwd(), '.env.example'),
      'utf8'
    )
    
    const requiredVars = [
      'NEXT_PUBLIC_APP_URL',
      'DATABASE_URL'
    ]

    requiredVars.forEach(variable => {
      expect(envExample).toContain(variable)
    })
  })
}) 