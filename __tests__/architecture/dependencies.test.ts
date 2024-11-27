import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Project Dependencies", () => {
	const packageJson = JSON.parse(
		readFileSync(join(process.cwd(), "package.json"), "utf8")
	);

	it("has required dependencies", () => {
		const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
		
		// Core dependencies
		expect(deps["next"]).toBeDefined();
		expect(deps["react"]).toBeDefined();
		expect(deps["react-dom"]).toBeDefined();
		
		// Testing dependencies
		expect(deps["vitest"]).toBeDefined();
		expect(deps["@testing-library/react"]).toBeDefined();
		
		// Styling dependencies
		expect(deps["tailwindcss"]).toBeDefined();
		expect(deps["@tailwindcss/typography"]).toBeDefined();
	});

	it("has correct TypeScript configuration", () => {
		expect(packageJson.devDependencies["typescript"]).toBeDefined();
		expect(packageJson.devDependencies["@types/react"]).toBeDefined();
	});

	it("has required scripts", () => {
		expect(packageJson.scripts.dev).toBeDefined();
		expect(packageJson.scripts.build).toBeDefined();
		expect(packageJson.scripts.start).toBeDefined();
		expect(packageJson.scripts.test).toBeDefined();
	});
});
