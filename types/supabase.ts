export interface Document {
	id: string;
	chat_id: string;
	title: string;
	content: string;
	status: "processing" | "ready" | "error";
	created_at: string;
	updated_at?: string;
}

export interface Attachment {
	url: string;
	name: string;
	contentType: string;
	path?: string;
}
