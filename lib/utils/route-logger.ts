import path from 'path';
import fs from 'fs';

interface RouteInfo {
  path: string;
  methods: string[];
  group?: string;
}

export function logRoutes() {
  const appDir = path.join(process.cwd(), 'app');
  const routes = scanRoutes(appDir);

  console.log('\n🚀 API Routes:\n');
  
  // Group routes by their group
  const groupedRoutes = routes.reduce((acc, route) => {
    const group = route.group || 'default';
    acc[group] = acc[group] || [];
    acc[group].push(route);
    return acc;
  }, {} as Record<string, RouteInfo[]>);

  Object.entries(groupedRoutes).forEach(([group, routes]) => {
    console.log(`\n${group}:`);
    routes.forEach(route => {
      console.log(
        `→ ${route.path}`
        + `\n  Methods: ${route.methods.join(', ')}\n`
      );
    });
  });
}

function scanRoutes(dir: string, base = ''): RouteInfo[] {
  const routes: RouteInfo[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')');
      const newBase = isGroup ? base : routePath;
      
      routes.push(...scanRoutes(fullPath, newBase));
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        .filter(method => content.includes(`export async function ${method}`));

      routes.push({
        path: base.replace(/\\/g, '/'),
        methods,
        group: base.split('/')[1]?.match(/^\((.*)\)$/)?.[1]
      });
    }
  }

  return routes;
} 