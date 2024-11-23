import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('filters out falsy values', () => {
    expect(cn('class1', undefined, 'class2', null)).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const result = cn('base', {
      'included': true,
      'excluded': false
    })
    expect(result).toContain('base')
    expect(result).toContain('included')
    expect(result).not.toContain('excluded')
  })
}) 