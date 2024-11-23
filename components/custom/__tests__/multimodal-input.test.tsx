import { render, fireEvent, screen } from "@testing-library/react";
import { MultimodalInput } from "../multimodal-input";
import { vi } from "vitest";

describe("MultimodalInput", () => {
	const defaultProps = {
		input: "",
		setInput: vi.fn(),
		isLoading: false,
		stop: vi.fn(),
		attachments: [],
		setAttachments: vi.fn(),
		messages: [],
		setMessages: vi.fn(),
		append: vi.fn(),
		handleSubmit: vi.fn(),
		chatId: "test-chat",
	};

	it("should render without crashing", () => {
		render(<MultimodalInput {...defaultProps} />);
		expect(
			screen.getByPlaceholderText("Send a message..."),
		).toBeInTheDocument();
	});

	it("should call setInput on input change", () => {
		render(<MultimodalInput {...defaultProps} />);
		const textarea = screen.getByPlaceholderText("Send a message...");
		fireEvent.change(textarea, { target: { value: "Hello" } });
		expect(defaultProps.setInput).toHaveBeenCalledWith("Hello");
	});

	it("should add a file to attachments on successful upload", async () => {
		render(<MultimodalInput {...defaultProps} />);
		const fileInput = screen.getByLabelText(/upload/i);
		const file = new File(["content"], "test.png", { type: "image/png" });

		fireEvent.change(fileInput, { target: { files: [file] } });

		// Simulate successful upload
		await screen.findByText("Files uploaded successfully");
		expect(defaultProps.setAttachments).toHaveBeenCalledWith(
			expect.arrayContaining([expect.objectContaining({ name: "test.png" })]),
		);
	});

	it("should trigger web search on button click", async () => {
		render(<MultimodalInput {...defaultProps} input="blockchain news" />);
		const webSearchButton = screen.getByRole("button", { name: /web search/i });

		// Mock fetch to simulate a successful search
		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ results: "Sample search results" }),
			}),
		) as jest.Mock;

		fireEvent.click(webSearchButton);

		// Check if append was called with search results
		await screen.findByText(/web search results for: blockchain news/i);
		expect(defaultProps.append).toHaveBeenCalledWith(
			expect.objectContaining({
				content: expect.stringContaining("Sample search results"),
			}),
		);
	});
});
