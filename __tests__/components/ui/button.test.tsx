import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
	it("renders with default props", () => {
		render(<Button>Click me</Button>);
		const button = screen.getByText("Click me");
		expect(button).toBeInTheDocument();
		expect(button).toHaveClass("bg-primary");
	});

	it("renders with outline variant", () => {
		render(<Button variant="outline">Outline Button</Button>);
		const button = screen.getByText("Outline Button");
		expect(button).toHaveClass("border-input");
	});

	it("renders with small size", () => {
		render(<Button size="sm">Small Button</Button>);
		const button = screen.getByText("Small Button");
		expect(button).toHaveClass("h-9");
	});

	it("renders as a link", () => {
		render(
			<Button asChild>
				<a href="/test">Link Button</a>
			</Button>
		);
		const link = screen.getByText("Link Button");
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/test");
	});
});
