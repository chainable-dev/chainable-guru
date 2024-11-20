import fs from 'fs';
import path from 'path';

import { describe, it, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@__tests__/setup';

describe('Next.js Routing', () => {
  afterEach(() => {
    cleanup();
  });

  const appDir = path.join(process.cwd(), 'app');
  
  it('uses kebab-case for static routes', () => {
    const dirs = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const staticRoutes = dirs.filter(dir => 
      !dir.startsWith('[') && 
      !dir.startsWith('(') && 
      !dir.startsWith('_')    
    );
    
    staticRoutes.forEach(route => {
      expect(route).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });
  });

  it('uses PascalCase for dynamic segments', () => {
    const dirs = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const dynamicRoutes = dirs.filter(dir => 
      dir.startsWith('[') && dir.endsWith(']')
    );
    
    dynamicRoutes.forEach(route => {
      const segment = route.slice(1, -1);
      expect(segment).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
    });
  });

  it('uses valid route group naming', () => {
    const dirs = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const routeGroups = dirs.filter(dir => 
      dir.startsWith('(') && dir.endsWith(')')
    );
    
    routeGroups.forEach(group => {
      const groupName = group.slice(1, -1);
      expect(groupName).toMatch(/^[a-zA-Z][a-zA-Z0-9-_]*$/);
    });
  });
}); 