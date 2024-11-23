import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("Project Structure", () => {
	const rootDir = process.cwd();

	it("has required directories", () => {
		const dirs = ["app", "components", "lib"];
		dirs.forEach((dir) => {
			expect(fs.existsSync(path.join(rootDir, dir))).toBe(true);
		});
	});

	it("has no pages directory", () => {
		expect(fs.existsSync(path.join(rootDir, "pages"))).toBe(false);
	});

	it("has required app subdirectories", () => {
		const appDirs = ["(auth)", "(chat)"];
		appDirs.forEach((dir) => {
			expect(fs.existsSync(path.join(rootDir, "app", dir))).toBe(true);
		});
	});
});
