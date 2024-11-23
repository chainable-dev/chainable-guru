import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMounted } from '@/lib/hooks/use-mounted'

describe('useMounted Hook', () => {
  it('returns true after mounting', () => {
    const { result } = renderHook(() => useMounted())
    expect(result.current).toBe(true)
  })
}) 