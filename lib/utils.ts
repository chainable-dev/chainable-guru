import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

interface Message {
	role: string
	content: string | Record<string, unknown>
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function generateUUID(): string {
	return crypto.randomUUID();
}

export function getMostRecentUserMessage(messages: Message[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].role === 'user') {
			const content = messages[i].content
			if (typeof content === 'string') {
				return content
			}
			return JSON.stringify(content)
		}
	}
	return ''
}

export function sanitizeResponseMessages(messages: Message[]): Message[] {
	return messages.map(message => ({
		...message,
		content: typeof message.content === 'string' 
			? message.content 
			: JSON.stringify(message.content)
	}));
}