import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config";

describe("Next.js Configuration", () => {
	it("has required config options", () => {
		expect(nextConfig).toBeDefined();
		expect(nextConfig).toHaveProperty("reactStrictMode", true);
		expect(nextConfig).toHaveProperty("typescript");
		expect(nextConfig).toHaveProperty("eslint");
	});

	it("has proper image configuration", () => {
		expect(nextConfig).toHaveProperty("images");
		if (nextConfig.images) {
			expect(nextConfig.images).toHaveProperty("remotePatterns");
			expect(Array.isArray(nextConfig.images.remotePatterns)).toBe(true);
			expect(nextConfig.images.remotePatterns).toContainEqual({
				protocol: 'https',
				hostname: '**',
			});
		}
	});

	it("has proper experimental features", () => {
		expect(nextConfig).toHaveProperty("experimental");
		if (nextConfig.experimental) {
			expect(nextConfig.experimental).toHaveProperty("serverActions", true);
		}
	});
});
