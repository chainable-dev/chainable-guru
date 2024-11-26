import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message, UIMessage } from "@/types/message";
import { Logger } from "./logger";

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get message ID from annotations
export function getMessageIdFromAnnotations(annotations?: { id?: string }[]): string | undefined {
  Logger.debug('Getting message ID from annotations', 'Utils', { annotations });
  if (!annotations || annotations.length === 0) return undefined;
  return annotations[0]?.id;
}

// Sanitize UI messages by removing loading and error states
export function sanitizeUIMessages(messages: UIMessage[]): Message[] {
  Logger.debug('Sanitizing UI messages', 'Utils', { messageCount: messages.length });
  return messages.map(({ isLoading, error, ...message }) => message);
}

// Get document timestamp by index
export function getDocumentTimestampByIndex(index: number, documents: { timestamp?: string }[]): string {
  Logger.debug('Getting document timestamp by index', 'Utils', { index, documentsCount: documents.length });
  return documents[index]?.timestamp || new Date().toISOString();
}

// Format date to locale string
export function formatDate(date: Date | string): string {
  Logger.debug('Formatting date', 'Utils', { date });
  return new Date(date).toLocaleString();
}

// Delay execution
export function delay(ms: number): Promise<void> {
  Logger.debug('Delaying execution', 'Utils', { ms });
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate a random ID
export function generateId(): string {
  Logger.debug('Generating random ID', 'Utils');
  return Math.random().toString(36).substring(2, 15);
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  Logger.debug('Checking if object is empty', 'Utils', { obj });
  return Object.keys(obj).length === 0;
}

// Remove duplicate messages by ID
export function removeDuplicateMessages(messages: Message[]): Message[] {
  Logger.debug('Removing duplicate messages', 'Utils', { messageCount: messages.length });
  const seen = new Set();
  return messages.filter(msg => {
    const duplicate = seen.has(msg.id);
    seen.add(msg.id);
    return !duplicate;
  });
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number): string {
  Logger.debug('Truncating text', 'Utils', { textLength: text.length, maxLength });
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
} 