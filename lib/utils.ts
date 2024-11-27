import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Message } from "ai"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export async function fetcher<T = any>(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(input, init);

	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	return response.json();
}

export function getMessageIdFromAnnotations(message: Message) {
	if (!message.annotations) return message.id;

	const [annotation] = message.annotations;

	if (!annotation?.messageIdFromServer) return message.id;

	return annotation.messageIdFromServer;
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
	return messages.filter(message => 
		message.content.length > 0 || 
		(message.toolInvocations && message.toolInvocations.length > 0)
	);
}

export function getDocumentTimestampByIndex(documents: any[], index: number) {
	if (!documents) return new Date();
	if (index > documents.length) return new Date();

	return documents[index].created_at;
}
