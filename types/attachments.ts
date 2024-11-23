import type { Attachment as AIAttachment } from 'ai';

export interface Attachment extends Omit<AIAttachment, 'name'> {
	url?: string;
	name: string | undefined;
	contentType?: string;
	path?: string;
}

export type { AIAttachment };

export interface ChatAttachment {
	experimental_attachments?: Attachment[];
}
