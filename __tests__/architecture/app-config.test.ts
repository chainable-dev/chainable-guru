import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("Next.js Configuration", () => {
	const nextConfig = require(path.join(process.cwd(), "next.config.js"));

	it("has required next config options", () => {
		expect(nextConfig).toHaveProperty("reactStrictMode");
	});

	it("has correct module exports", () => {
		expect(typeof nextConfig).toBe("object");
	});

	it("follows app directory conventions", () => {
		const appDir = path.join(process.cwd(), "app");
		const contents = fs.readdirSync(appDir);

		// Check for essential app router files
		expect(contents).toContain("layout.tsx");

		// Check route groups are properly named
		const routeGroups = contents.filter(
			(item) =>
				fs.statSync(path.join(appDir, item)).isDirectory() &&
				item.startsWith("("),
		);

		routeGroups.forEach((group) => {
			expect(group).toMatch(/^\([a-z-]+\)$/);
		});
	});
});
