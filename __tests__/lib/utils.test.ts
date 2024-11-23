import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('combines basic classes', () => {
      expect(cn('a', 'b')).toBe('a b')
    })

    it('handles undefined values', () => {
      expect(cn('a', undefined, 'b')).toBe('a b')
    })

    it('handles null values', () => {
      expect(cn('a', null, 'b')).toBe('a b')
    })

    it('handles boolean conditions', () => {
      expect(cn('a', false && 'b', true && 'c')).toBe('a c')
    })

    it('handles object syntax', () => {
      expect(cn('a', { b: true, c: false })).toBe('a b')
    })
  })
}) 