import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@__tests__/setup';

describe('Next.js App Router Structure', () => {
  afterEach(() => {
    cleanup();
  });

  const rootDir = process.cwd();
  const componentsDir = path.join(rootDir, 'components');
  const appDir = path.join(rootDir, 'app');

  it('has correct directory structure', () => {
    // Check app directory exists
    expect(fs.existsSync(appDir)).toBe(true);
    
    // Check components directory exists
    expect(fs.existsSync(componentsDir)).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, 'ui'))).toBe(true);
    expect(fs.existsSync(path.join(componentsDir, 'custom'))).toBe(true);
  });

  it('follows Next.js app router conventions', () => {
    // Check for required app router files
    const layoutExists = fs.existsSync(path.join(appDir, 'layout.tsx'));
    const pageExists = fs.existsSync(path.join(appDir, 'page.tsx'));
                      
    expect(layoutExists).toBe(true);
    expect(pageExists).toBe(true);
  });

  it('does not use pages directory', () => {
    const pagesDir = path.join(rootDir, 'pages');
    expect(fs.existsSync(pagesDir)).toBe(false);
  });
}); 