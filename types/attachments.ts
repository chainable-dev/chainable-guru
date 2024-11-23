import type { Attachment as AIAttachment } from 'ai';

export interface Attachment {
	url: string;
	name: string;
	contentType: string;
	path?: string;
}

export type { AIAttachment };

export interface ChatAttachment {
	experimental_attachments?: Attachment[];
}
