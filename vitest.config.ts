/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()] as any,
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["__tests__/setup.ts"],
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules/**"],
		coverage: {
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/**",
				"__tests__/**",
				"**/*.d.ts",
				"**/*.config.{js,ts}",
				"**/types/**",
			],
		},
		deps: {
			inline: ["vitest-canvas-mock"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
