import fs from "fs";

import { describe, it, expect } from "vitest";

describe("Project Architecture", () => {
	it("should follow correct component organization", () => {
		const componentDirs = fs.readdirSync("components");
		expect(componentDirs).toContain("ui");
		// Update or remove this line if 'forms' is not needed
		// expect(componentDirs).toContain('forms');
	});
});
