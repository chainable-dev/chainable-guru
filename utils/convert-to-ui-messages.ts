import { Message, UIMessage, Role } from "@/types/message";

// Convert database messages to UI messages
export function convertToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    created_at: msg.created_at,
    updated_at: msg.updated_at,
    chat_id: msg.chat_id,
    isLoading: false,
    error: false
  }));
}

// Create a loading message for UI feedback
export function createLoadingMessage(id: string = crypto.randomUUID()): UIMessage {
  return {
    id,
    role: "assistant",
    content: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_id: "",
    isLoading: true,
    error: false
  };
}

// Create an error message for UI feedback
export function createErrorMessage(error: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: error,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_id: "",
    isLoading: false,
    error: true
  };
}

// Create a system message
export function createSystemMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "system",
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_id: ""
  };
}

// Create a user message
export function createUserMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_id: ""
  };
}

// Create an assistant message
export function createAssistantMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    chat_id: ""
  };
}

