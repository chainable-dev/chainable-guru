import { describe, it, expect } from "vitest";
import nextConfig from "@/next.config";

describe("Next.js Configuration", () => {
	it("has expected configuration options", () => {
		expect(nextConfig).toBeDefined();
		expect(nextConfig.reactStrictMode).toBe(true);
	});

	it("has expected compiler options", () => {
		expect(nextConfig.compiler).toBeDefined();
		if (nextConfig.compiler) {
			expect(nextConfig.compiler.styledComponents).toBeDefined();
		}
	});

	it("has expected experimental features", () => {
		expect(nextConfig.experimental).toBeDefined();
		if (nextConfig.experimental) {
			expect(nextConfig.experimental.serverActions).toBeDefined();
		}
	});
});
