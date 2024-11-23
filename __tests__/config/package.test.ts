import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("Package Configuration", () => {
	const packageJson = JSON.parse(
		fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
	);

	it("has required fields", () => {
		expect(packageJson).toHaveProperty("name");
		expect(packageJson).toHaveProperty("version");
		expect(packageJson).toHaveProperty("scripts");
	});

	it("has required dependencies", () => {
		const deps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};
		const required = ["next", "react", "react-dom", "typescript"];
		required.forEach((dep) => {
			expect(deps).toHaveProperty(dep);
		});
	});
});
