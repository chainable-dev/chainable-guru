import { put } from "@vercel/blob";
import { nanoid } from "nanoid";

export async function uploadToBlob(file: File) {
	try {
		const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "-").toLowerCase();
		const filename = `${nanoid()}-${safeFileName}`;

		const { url } = await put(filename, file, {
			access: "public",
			token: process.env.BLOB_READ_WRITE_TOKEN,
		});

		return {
			url,
			name: file.name,
			contentType: file.type,
			path: filename,
		};
	} catch (error) {
		console.error("Error uploading to blob:", error);
		throw error;
	}
}
