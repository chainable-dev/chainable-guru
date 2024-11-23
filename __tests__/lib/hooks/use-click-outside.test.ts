import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

describe("useClickOutside Hook", () => {
	it("sets up event listener", () => {
		const handler = vi.fn();
		const ref = { current: document.createElement("div") };

		renderHook(() => useClickOutside(ref, handler));

		// Simulate click outside
		document.dispatchEvent(new MouseEvent("mousedown"));
		expect(handler).toHaveBeenCalled();
	});
});
