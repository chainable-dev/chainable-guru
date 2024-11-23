import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with Testing Library's matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock environment variables
process.env.NEXT_PUBLIC_FEATURE_ATTACHMENTS = 'true';
process.env.NEXT_PUBLIC_FEATURE_WEB_SEARCH = 'true';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

// Add React to global scope
global.React = React; 