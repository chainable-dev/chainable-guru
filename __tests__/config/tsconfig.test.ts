import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("TypeScript Configuration", () => {
	const tsconfig = JSON.parse(
		readFileSync(join(process.cwd(), "tsconfig.json"), "utf8")
	);

	it("has expected compiler options", () => {
		expect(tsconfig.compilerOptions).toBeDefined();
		expect(tsconfig.compilerOptions.target).toBe("es5");
		expect(tsconfig.compilerOptions.lib).toContain("dom");
		expect(tsconfig.compilerOptions.strict).toBe(true);
	});

	it("has expected module resolution settings", () => {
		expect(tsconfig.compilerOptions.moduleResolution).toBe("bundler");
		expect(tsconfig.compilerOptions.allowImportingTsExtensions).toBe(true);
		expect(tsconfig.compilerOptions.resolveJsonModule).toBe(true);
		expect(tsconfig.compilerOptions.isolatedModules).toBe(true);
	});

	it("has expected path aliases", () => {
		expect(tsconfig.compilerOptions.paths).toBeDefined();
		expect(tsconfig.compilerOptions.paths["@/*"]).toEqual(["*"]);
	});
});
