/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		setupFiles: ["__tests__/setup.ts"],
		globals: true,
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/.next/**",
			"**/multimodal-input.test.tsx",
			"**/chat-route.test.ts",
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./"),
		},
	},
});
