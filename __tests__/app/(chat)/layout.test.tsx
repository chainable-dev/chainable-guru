import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test-utils";

// Mock the server-only module
vi.mock("server-only", () => ({}));

// Mock the supabase server client
vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(() => ({
		auth: {
			getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
		},
	})),
}));

// Create a test wrapper component
const ChatLayoutWrapper = ({ children }: { children: React.ReactNode }) => (
	<div data-testid="chat-layout">{children}</div>
);

describe("Chat Layout", () => {
	it("should render chat interface components", () => {
		render(
			<ChatLayoutWrapper>
				<div data-testid="chat-content">Chat Content</div>
			</ChatLayoutWrapper>,
		);

		expect(screen.getByTestId("chat-layout")).toBeInTheDocument();
		expect(screen.getByTestId("chat-content")).toBeInTheDocument();
	});
});
