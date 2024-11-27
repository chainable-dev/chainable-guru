import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input Component", () => {
	it("renders correctly", () => {
		const { container } = render(<Input />);
		expect(container.querySelector("input")).toBeDefined();
	});

	it("handles value changes", () => {
		const handleChange = vi.fn();
		const { container } = render(<Input onChange={handleChange} />);
		const input = container.querySelector("input")!;

		fireEvent.change(input, { target: { value: "test" } });
		expect(handleChange).toHaveBeenCalled();
	});

	it("renders input element", () => {
		render(<Input />);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		render(<Input className="custom" />);
		expect(screen.getByRole("textbox")).toHaveClass("custom");
	});

	it("accepts different types", () => {
		render(
			<>
				<Input type="text" placeholder="Text" />
				<Input type="password" placeholder="Password" />
				<Input type="email" placeholder="Email" />
				<Input type="number" placeholder="Number" />
			</>
		);

		expect(screen.getByPlaceholderText("Text")).toHaveAttribute("type", "text");
		expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password");
		expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
		expect(screen.getByPlaceholderText("Number")).toHaveAttribute("type", "number");
	});

	it("handles disabled state", () => {
		render(<Input disabled />);
		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("forwards ref correctly", () => {
		const { container } = render(<Input />);
		expect(container.querySelector("input")).toHaveAttribute("class", expect.stringContaining("flex h-9"));
	});
});
