import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
}));

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	clear: vi.fn(),
	removeItem: vi.fn(),
	length: 0,
	key: vi.fn(),
};

global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = vi.fn();
