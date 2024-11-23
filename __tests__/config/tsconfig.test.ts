import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("TypeScript Configuration", () => {
	const tsConfig = JSON.parse(
		fs.readFileSync(path.join(process.cwd(), "tsconfig.json"), "utf8"),
	);

	it("has compilerOptions", () => {
		expect(tsConfig.compilerOptions).toBeDefined();
	});

	it("has include array", () => {
		expect(Array.isArray(tsConfig.include)).toBe(true);
	});
});
