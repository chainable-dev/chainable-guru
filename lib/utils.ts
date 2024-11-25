import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Message } from "@/types/message";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

type FetcherOptions = {
	method?: string
	headers?: Record<string, string>
	body?: any
	signal?: AbortSignal
}

export async function fetcher<T>(
	url: string,
	options: FetcherOptions = {}
): Promise<T> {
	const { 
		method = 'GET',
		headers = {},
		body,
		signal
	} = options

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'An error occurred while fetching the data')
	}

	return res.json()
}

export async function fetchWithProgress<T>(
	url: string,
	options: FetcherOptions = {},
	onProgress?: (chunk: any) => void
): Promise<T> {
	const { 
		method = 'GET',
		headers = {},
		body,
		signal
	} = options

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			...headers
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'An error occurred while fetching the data')
	}

	if (!res.body) {
		throw new Error('ReadableStream not supported')
	}

	const reader = res.body.getReader()
	const decoder = new TextDecoder()
	let result = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break

		const chunk = decoder.decode(value, { stream: true })
		result += chunk

		if (onProgress) {
			try {
				const json = JSON.parse(chunk)
				onProgress(json)
			} catch (e) {
				// Ignore parse errors for partial chunks
			}
		}
	}

	try {
		return JSON.parse(result)
	} catch (e) {
		throw new Error('Invalid JSON response')
	}
}

export function generateId(): string {
	return crypto.randomUUID()
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	}).format(date)
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a UUID for message/chat IDs
 */
export function generateUUID(): string {
	return crypto.randomUUID();
}

/**
 * Get the most recent user message from a list of messages
 */
export function getMostRecentUserMessage(messages: Message[]): string | null {
	const userMessages = messages.filter(msg => msg.role === 'user');
	return userMessages.length > 0 ? userMessages[userMessages.length - 1].content : null;
}

/**
 * Sanitize response messages to ensure content is always a string
 */
export function sanitizeResponseMessages(messages: Message[]): Message[] {
	return messages.map(msg => ({
		...msg,
		content: typeof msg.content === 'string' 
			? msg.content 
			: JSON.stringify(msg.content),
		createdAt: msg.createdAt || new Date().toISOString()
	}));
}

/**
 * Truncate text to a maximum length while preserving words
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...';
}

/**
 * Format error messages for display
 */
export function formatErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === 'string') return error;
	return 'An unknown error occurred';
}

/**
 * Parse and validate message content
 */
export function parseMessageContent(content: unknown): string {
	if (typeof content === 'string') return content;
	if (content === null || content === undefined) return '';
	return JSON.stringify(content);
}

/**
 * Validate message format
 */
export function validateMessage(message: Partial<Message>): Message {
	if (!message.id) message.id = generateUUID();
	if (!message.role || !['user', 'assistant', 'system', 'function'].includes(message.role)) {
		throw new Error('Invalid message role');
	}
	if (!message.content && !message.function_call) {
		throw new Error('Message must have content or function call');
	}
	
	return {
		id: message.id,
		role: message.role,
		content: parseMessageContent(message.content),
		createdAt: message.createdAt || new Date().toISOString(),
		...(message.name && { name: message.name }),
		...(message.function_call && { function_call: message.function_call })
	} as Message;
}
