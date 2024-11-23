import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("TypeScript Configuration", () => {
	const tsConfig = JSON.parse(
		fs.readFileSync(path.join(process.cwd(), "tsconfig.json"), "utf8"),
	);

	it("has strict mode enabled", () => {
		expect(tsConfig.compilerOptions.strict).toBe(true);
	});

	it("has essential compiler options", () => {
		const required = [
			"esModuleInterop",
			"skipLibCheck",
			"forceConsistentCasingInFileNames",
			"noEmit",
		];

		required.forEach((option) => {
			expect(tsConfig.compilerOptions[option]).toBeDefined();
		});
	});

	it("includes required paths", () => {
		expect(tsConfig.include).toContain("next-env.d.ts");
		expect(tsConfig.include).toContain("**/*.ts");
		expect(tsConfig.include).toContain("**/*.tsx");
	});
});
