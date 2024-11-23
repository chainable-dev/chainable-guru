import { vi, describe, it, expect, beforeEach } from 'vitest'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

// Mock external modules
vi.mock('fs')
vi.mock('sharp')
vi.mock('path', () => ({
  basename: vi.fn(),
  join: vi.fn()
}))

describe('Image Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create output directories if they don\'t exist', async () => {
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync')
    await import('@/scripts/optimize-images')
    expect(mkdirSpy).toHaveBeenCalled()
  })

  it('should process images with correct options', async () => {
    const sharpMock = vi.fn().mockReturnValue({
      resize: vi.fn().mockReturnThis(),
      toFile: vi.fn().mockResolvedValue(undefined)
    })
    vi.mocked(sharp).mockImplementation(sharpMock)
    vi.mocked(path.basename).mockReturnValue('test.png')

    const { optimizeImage } = await import('@/scripts/optimize-images')
    await optimizeImage('test.png', 'output', { width: 100 })

    expect(sharpMock).toHaveBeenCalledWith('test.png')
  })
}) 