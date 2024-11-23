import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("String Utilities", () => {
	it("handles empty inputs", () => {
		expect(cn("")).toBe("");
		expect(cn("", "")).toBe("");
	});

	it("handles multiple class combinations", () => {
		const result = cn(
			"base-class",
			{ conditional: true },
			undefined,
			["array-class"],
			null,
			false,
			"valid-class",
		);
		expect(result).toContain("base-class");
		expect(result).toContain("conditional");
		expect(result).toContain("array-class");
		expect(result).toContain("valid-class");
	});
});
