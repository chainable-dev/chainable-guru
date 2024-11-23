import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
	it("should merge classnames correctly", () => {
		const result = cn(
			"base-class",
			"second-class",
			{ "conditional-class": true },
			{ "false-class": false },
		);

		expect(result).toContain("base-class");
		expect(result).toContain("second-class");
		expect(result).toContain("conditional-class");
		expect(result).not.toContain("false-class");
	});

	it("should handle undefined and null values", () => {
		const result = cn("base-class", undefined, null, false);
		expect(result).toBe("base-class");
	});
});
