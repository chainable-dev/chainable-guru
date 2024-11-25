export type Role = "user" | "assistant" | "system" | "data" | "function";

export interface Message {
  id: string;
  role: Role;
  content: string | null;
  created_at: string;
  updated_at: string;
  chat_id: string;
}

export interface UIMessage extends Message {
  isLoading?: boolean;
  error?: boolean;
}
