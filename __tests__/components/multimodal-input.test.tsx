import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { act } from "react-dom/test-utils";

// Mock hooks
vi.mock("@/hooks/useWalletState", () => ({
	useWalletState: () => ({
		address: "0x123",
		isConnected: true,
		chainId: 8453,
		networkInfo: { name: "Base" },
		isCorrectNetwork: true,
	}),
}));

// Mock localStorage hook
vi.mock("usehooks-ts", () => ({
	useLocalStorage: () => ["", vi.fn()],
	useWindowSize: () => ({ width: 1024, height: 768 }),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
	createClient: () => ({
		from: () => ({
			select: () => ({
				eq: () => ({
					single: () => Promise.resolve({ data: null, error: null }),
				}),
			}),
		}),
	}),
}));

// Mock EventSource
class MockEventSource {
	onmessage: ((event: MessageEvent) => void) | null = null;
	close = vi.fn();

	constructor(url: string) {
		setTimeout(() => {
			if (this.onmessage) {
				this.onmessage(new MessageEvent('message', {
					data: JSON.stringify({
						type: 'intermediate',
						content: 'Thinking...',
					})
				}));
			}
		}, 100);
	}
}

global.EventSource = MockEventSource as any;

// Mock fetch for file uploads
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ url: 'test-url' }),
	})
) as any;

describe("MultimodalInput", () => {
	const mockProps = {
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
		chatId: "test-chat-id",
		className: "",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		global.URL.createObjectURL = vi.fn(() => "blob:test");
		global.URL.revokeObjectURL = vi.fn();
	});

	it("handles text input correctly", async () => {
		render(<MultimodalInput {...mockProps} />);
		const textarea = screen.getByRole("textbox");

		await userEvent.type(textarea, "Test message");
		expect(mockProps.setInput).toHaveBeenCalledWith("Test message");
	});

	it("handles file uploads", async () => {
		const file = new File(["test"], "test.txt", { type: "text/plain" });
		render(<MultimodalInput {...mockProps} />);

		const input = screen.getByTestId("file-input");
		await act(async () => {
			await fireEvent.change(input, { target: { files: [file] } });
		});

		expect(URL.createObjectURL).toHaveBeenCalledWith(file);
		await waitFor(() => {
			expect(screen.getByText(/Uploading/)).toBeInTheDocument();
		});
	});

	it("handles streaming responses", async () => {
		render(<MultimodalInput {...mockProps} />);
		
		await waitFor(() => {
			expect(screen.getByText("Thinking...")).toBeInTheDocument();
		});
	});

	it("cleans up resources on unmount", () => {
		const { unmount } = render(<MultimodalInput {...mockProps} />);
		const mockClose = vi.fn();
		vi.spyOn(global.EventSource.prototype, 'close').mockImplementation(mockClose);
		
		unmount();
		expect(mockClose).toHaveBeenCalled();
		expect(URL.revokeObjectURL).toHaveBeenCalled();
	});

	it("handles loading state", () => {
		render(<MultimodalInput {...mockProps} isLoading={true} />);
		expect(screen.getByRole("textbox")).toBeDisabled();
		expect(screen.getByTestId("stop-button")).toBeInTheDocument();
	});
});
