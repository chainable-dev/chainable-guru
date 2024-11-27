import { vi } from "vitest";
import { beforeAll } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock URL constructor
global.URL = vi.fn(() => ({
	searchParams: new URLSearchParams(),
})) as any;

// Add any other global mocks needed

beforeAll(() => {
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  process.env.NODE_ENV = 'test';
});
