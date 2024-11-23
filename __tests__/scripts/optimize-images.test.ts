import { describe, expect, it, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock modules before importing any code that uses them
vi.mock('fs', () => ({
  default: {
    mkdirSync: vi.fn(),
    existsSync: vi.fn(),
    unlinkSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
  },
}));

vi.mock('path', () => ({
  default: {
    join: vi.fn(),
    parse: vi.fn(),
  },
}));

// Mock sharp with a factory function
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  }));
  return { default: mockSharp };
});

describe('Image Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create output directories if they don\'t exist', async () => {
    const { mkdirSync } = await import('fs');
    await import('@/scripts/optimize-images');
    expect(mkdirSync).toHaveBeenCalledTimes(2);
  });

  it('should process images with correct options', async () => {
    const sharp = (await import('sharp')).default;
    const { optimizeImage } = await import('@/scripts/optimize-images');
    
    await optimizeImage('test.png', 'output', { width: 100 });
    
    expect(sharp).toHaveBeenCalledWith('test.png');
    expect(sharp().resize).toHaveBeenCalledWith({ width: 100 });
    expect(sharp().webp).toHaveBeenCalled();
    expect(sharp().png).toHaveBeenCalled();
    expect(sharp().toFile).toHaveBeenCalled();
  });
}); 