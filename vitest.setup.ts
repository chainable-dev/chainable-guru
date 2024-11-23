import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock URL constructor
global.URL = vi.fn(() => ({
  searchParams: new URLSearchParams(),
})) as any;

// Add any other global mocks needed 