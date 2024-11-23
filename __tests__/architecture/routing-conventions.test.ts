import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("Next.js Routing Conventions", () => {
	const appDir = path.join(process.cwd(), "app");

	it("follows route group naming conventions", () => {
		const dirs = fs.readdirSync(appDir, { withFileTypes: true });
		const routeGroups = dirs.filter(
			(dir) => dir.isDirectory() && dir.name.startsWith("("),
		);

		routeGroups.forEach((group) => {
			// Route groups should be kebab-case within parentheses
			expect(group.name).toMatch(/^\([a-z-]+\)$/);

			// Each route group should have a layout
			expect(fs.existsSync(path.join(appDir, group.name, "layout.tsx"))).toBe(
				true,
			);
		});
	});

	it("has proper dynamic route segments", () => {
		const chatDir = path.join(appDir, "(chat)", "chat");
		if (fs.existsSync(chatDir)) {
			const dynamicRoutes = fs
				.readdirSync(chatDir, { withFileTypes: true })
				.filter((entry) => entry.isDirectory() && entry.name.startsWith("["));

			dynamicRoutes.forEach((route) => {
				// Dynamic segments should be in [brackets]
				expect(route.name).toMatch(/^\[[a-zA-Z]+\]$/);

				// Should have a page.tsx
				expect(fs.existsSync(path.join(chatDir, route.name, "page.tsx"))).toBe(
					true,
				);
			});
		}
	});

	it("has proper API route structure", () => {
		const apiDir = path.join(appDir, "(chat)", "api");
		if (fs.existsSync(apiDir)) {
			const apiRoutes = fs
				.readdirSync(apiDir, { withFileTypes: true })
				.filter((entry) => entry.isDirectory());

			apiRoutes.forEach((route) => {
				// Each API route should have a route.ts file
				expect(fs.existsSync(path.join(apiDir, route.name, "route.ts"))).toBe(
					true,
				);
			});
		}
	});
});
