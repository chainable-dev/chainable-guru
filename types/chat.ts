import type { Message, CreateMessage, ChatRequestOptions } from 'ai';
import type { Attachment, AIAttachment } from './attachments';

export interface ChatProps {
  id: string;
  initialMessages: Message[];
  selectedModelId: string;
}

export interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: AIAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<AIAttachment[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  append: (
    message: CreateMessage,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  className?: string;
}

export interface FileUploadState {
  progress: number;
  uploading: boolean;
  error: string | null;
} 