import "@testing-library/jest-dom";

// Mock Next.js components and functions
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/",
}));

vi.mock("next/headers", () => ({
	headers: () => new Headers(),
	cookies: () => ({
		get: vi.fn(),
		set: vi.fn(),
	}),
}));
