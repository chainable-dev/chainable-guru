import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Project Architecture', () => {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  const appDir = path.join(rootDir, 'app');

  it('should follow correct folder structure', () => {
    // Check root level directories
    const rootDirs = fs.readdirSync(rootDir).filter(
      f => fs.statSync(path.join(rootDir, f)).isDirectory()
    );
    
    expect(rootDirs).toContain('app');
    expect(rootDirs).toContain('src');
    expect(rootDirs).not.toContain('pages'); // No pages directory
  });

  it('should have correct app router structure', () => {
    const appDirs = fs.readdirSync(appDir);
    
    // Check for route groups
    expect(appDirs).toContain('(chat)');
    expect(appDirs).toContain('api');

    // Verify correct file naming
    const routeFiles = getAllFiles(appDir);
    routeFiles.forEach(file => {
      const fileName = path.basename(file);
      if (fileName !== 'layout.tsx' && 
          fileName !== 'page.tsx' && 
          fileName !== 'loading.tsx' && 
          fileName !== 'error.tsx' &&
          fileName !== 'route.ts') {
        expect(fileName).toMatch(/^[a-z-]+$/); // kebab-case for static routes
      }
    });
  });

  it('should not have duplicate component files', () => {
    const componentFiles = getAllFiles(path.join(srcDir, 'components'));
    const fileNames = componentFiles.map(f => path.basename(f));
    const uniqueFileNames = new Set(fileNames);
    
    expect(fileNames.length).toBe(uniqueFileNames.size);
  });

  it('should follow correct component organization', () => {
    const componentsDir = path.join(srcDir, 'components');
    expect(fs.existsSync(componentsDir)).toBe(true);

    // Check component directory structure
    const componentDirs = fs.readdirSync(componentsDir);
    expect(componentDirs).toContain('ui'); // shadcn components
    expect(componentDirs).toContain('Chat'); // feature components
  });

  it('should have correct API route structure', () => {
    const apiDir = path.join(appDir, 'api');
    const apiRoutes = getAllFiles(apiDir);

    apiRoutes.forEach(route => {
      const routeFile = path.basename(route);
      expect(routeFile).toBe('route.ts');
    });
  });

  it('should follow correct data fetching patterns', () => {
    const serverComponentFiles = getAllFiles(appDir);
    
    serverComponentFiles
      .filter(f => f.endsWith('.tsx') && !f.includes('client'))
      .forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        expect(content).not.toContain('useState');
        expect(content).not.toContain('useEffect');
      });
  });

  it('should have correct type definitions', () => {
    const typesDir = path.join(srcDir, 'types');
    expect(fs.existsSync(typesDir)).toBe(true);

    const typeFiles = getAllFiles(typesDir);
    typeFiles.forEach(file => {
      expect(path.extname(file)).toBe('.ts');
      expect(file).not.toContain('.js');
    });
  });
});

// Helper function to recursively get all files
function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
}

describe('Next.js App Router Best Practices', () => {
  it('should use correct metadata pattern', () => {
    const layoutFile = path.join(process.cwd(), 'app/layout.tsx');
    const content = fs.readFileSync(layoutFile, 'utf8');
    
    expect(content).toContain('metadata');
    expect(content).toContain('viewport');
  });

  it('should implement proper error boundaries', () => {
    const errorFile = path.join(process.cwd(), 'app/error.tsx');
    const content = fs.readFileSync(errorFile, 'utf8');
    
    expect(content).toContain('error.tsx');
    expect(content).toContain('reset');
  });

  it('should have correct loading states', () => {
    const loadingStates = getAllFiles(process.cwd())
      .filter(f => f.endsWith('loading.tsx'));
    
    expect(loadingStates.length).toBeGreaterThan(0);
  });

  it('should follow route group conventions', () => {
    const appDir = path.join(process.cwd(), 'app');
    const routeGroups = fs.readdirSync(appDir)
      .filter(f => f.startsWith('(') && f.endsWith(')'));
    
    routeGroups.forEach(group => {
      expect(group).toMatch(/^\([a-z-]+\)$/);
    });
  });

  it('should use server components by default', () => {
    const pageFiles = getAllFiles(process.cwd())
      .filter(f => f.endsWith('page.tsx'));
    
    pageFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toContain('"use client"');
    });
  });

  it('should have correct client component naming', () => {
    const clientComponents = getAllFiles(path.join(process.cwd(), 'src/components'))
      .filter(f => {
        const content = fs.readFileSync(f, 'utf8');
        return content.includes('"use client"');
      });

    clientComponents.forEach(file => {
      const fileName = path.basename(file);
      expect(fileName).toMatch(/^[A-Z][a-zA-Z]+\.(tsx|ts)$/);
    });
  });
}); 