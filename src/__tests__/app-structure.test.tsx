import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Next.js App Router Structure', () => {
  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');

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
    const layoutExists = fs.existsSync(path.join(appDir, 'layout.tsx')) || 
                        fs.existsSync(path.join(appDir, 'layout.js'));
    const pageExists = fs.existsSync(path.join(appDir, 'page.tsx')) || 
                      fs.existsSync(path.join(appDir, 'page.js'));
                      
    expect(layoutExists).toBe(true);
    expect(pageExists).toBe(true);
  });

  it('does not use pages directory', () => {
    const pagesDir = path.join(process.cwd(), 'pages');
    expect(fs.existsSync(pagesDir)).toBe(false);
  });
}); 