import { describe, it, expect } from "vitest";
import { readdirSync, statSync } from "fs";
import { join } from "path";

function getDirectories(path: string): string[] {
	return readdirSync(path).filter((file) => 
		statSync(join(path, file)).isDirectory()
	);
}

describe("Routing Conventions", () => {
	const appDir = join(process.cwd(), "app");
	const directories = getDirectories(appDir);

	it("has required app router directories", () => {
		expect(directories).toContain("(chat)");
		expect(directories).toContain("api");
	});

	it("has required page files", () => {
		const hasLayoutFile = readdirSync(appDir).includes("layout.tsx");
		expect(hasLayoutFile).toBe(true);
	});

	it("follows naming conventions", () => {
		const invalidNames = directories.filter(dir => 
			!dir.match(/^[a-z0-9()\-]+$/) && !dir.startsWith("_") && !dir.startsWith(".")
		);
		expect(invalidNames).toHaveLength(0);
	});
});
