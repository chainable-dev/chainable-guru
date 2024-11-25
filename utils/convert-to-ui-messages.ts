import { DatabaseMessage, Message, UIMessage, Role } from "@/types/message";

// Convert database messages to UI messages
export function convertToUIMessages(messages: DatabaseMessage[]): UIMessage[] {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as Role,
    content: msg.content || "",
    chat_id: msg.chat_id,
    createdAt: msg.created_at,
    updatedAt: msg.updated_at,
    isLoading: false,
    error: false
  }));
}

// Create a loading message
export function createLoadingMessage(id: string = crypto.randomUUID()): UIMessage {
  return {
    id,
    role: "assistant",
    content: "",
    chat_id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isLoading: true,
    error: false
  };
}

// Create an error message
export function createErrorMessage(error: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: error,
    chat_id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    chat_id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Create a user message
export function createUserMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    chat_id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Create an assistant message
export function createAssistantMessage(content: string): Message {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    chat_id: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

