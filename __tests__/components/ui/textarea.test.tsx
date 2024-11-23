import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Textarea } from "@/components/ui/textarea";

describe("Textarea Component", () => {
	it("renders with default props", () => {
		const { container } = render(<Textarea />);
		const textarea = container.querySelector("textarea");
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveClass("flex min-h-[80px] w-full rounded-md");
	});

	it("handles value changes", () => {
		const handleChange = vi.fn();
		const { container } = render(<Textarea onChange={handleChange} value="" />);
		const textarea = container.querySelector("textarea")!;

		fireEvent.change(textarea, { target: { value: "test input" } });
		expect(handleChange).toHaveBeenCalled();
	});

	it("handles disabled state", () => {
		const { container } = render(<Textarea disabled />);
		const textarea = container.querySelector("textarea");
		expect(textarea).toBeDisabled();
	});
});
