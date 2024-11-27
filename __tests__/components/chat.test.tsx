import { render, screen, waitFor } from "@testing-library/react";
import { Chat } from "@/components/custom/chat";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { TooltipProvider } from "@radix-ui/react-tooltip";

// Mock hooks and components
vi.mock("ai/react", () => ({
  useChat: () => ({
    messages: [],
    setMessages: vi.fn(),
    handleSubmit: vi.fn(),
    input: "",
    setInput: vi.fn(),
    append: vi.fn(),
    isLoading: false,
    stop: vi.fn(),
    data: null,
  }),
}));

vi.mock("usehooks-ts", () => ({
  useWindowSize: () => ({ width: 1024, height: 768 }),
}));

vi.mock("swr", () => ({
  default: () => ({ data: [], mutate: vi.fn() }),
  useSWRConfig: () => ({ mutate: vi.fn() }),
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

// Mock components
vi.mock("@/components/custom/chat-header", () => ({
  ChatHeader: () => <div data-testid="chat-header">Chat Header</div>,
}));

vi.mock("@/components/custom/overview", () => ({
  Overview: () => <div data-testid="overview">Overview</div>,
}));

vi.mock("@/components/custom/multimodal-input", () => ({
  MultimodalInput: () => <div data-testid="multimodal-input">Input</div>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <TooltipProvider>
      {ui}
    </TooltipProvider>
  );
};

describe("Chat", () => {
  const mockProps = {
    id: "test-chat-id",
    initialMessages: [],
    selectedModelId: "test-model",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders chat interface correctly", () => {
    renderWithProviders(<Chat {...mockProps} />);
    expect(screen.getByTestId("chat-header")).toBeInTheDocument();
    expect(screen.getByTestId("overview")).toBeInTheDocument();
    expect(screen.getByTestId("multimodal-input")).toBeInTheDocument();
  });

  it("handles streaming responses", async () => {
    vi.mocked(useChat).mockImplementation(() => ({
      messages: [],
      setMessages: vi.fn(),
      handleSubmit: vi.fn(),
      input: "",
      setInput: vi.fn(),
      append: vi.fn(),
      isLoading: true,
      stop: vi.fn(),
      data: null,
    }));

    renderWithProviders(<Chat {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText("Thinking...")).toBeInTheDocument();
    });
  });

  it("displays messages with streaming content", async () => {
    const messages = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];
    
    vi.mocked(useChat).mockImplementation(() => ({
      messages,
      setMessages: vi.fn(),
      handleSubmit: vi.fn(),
      input: "",
      setInput: vi.fn(),
      append: vi.fn(),
      isLoading: true,
      stop: vi.fn(),
      data: null,
    }));

    renderWithProviders(<Chat {...mockProps} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText("Thinking...")).toBeInTheDocument();
    });
  });
}); 