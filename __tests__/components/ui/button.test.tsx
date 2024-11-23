import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
	it("renders button element", () => {
		const { container } = render(<Button>Click me</Button>);
		expect(container.querySelector("button")).toBeDefined();
	});

	it("includes custom className", () => {
		const { container } = render(
			<Button className="custom-class">Click me</Button>,
		);
		expect(container.firstChild).toHaveClass("custom-class");
	});
});
