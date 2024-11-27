/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/__tests__/setup.ts'],
		include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/types/',
				'**/*.d.ts',
				'test{,s}/**',
				'**/*.test.{js,jsx,ts,tsx}',
				'**/__tests__/**',
			],
		},
	},
})
