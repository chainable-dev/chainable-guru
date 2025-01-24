import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const BUCKET_NAME = "chat_attachments";
const MAX_FILE_SIZE = 52428800; // 50MB in bytes
const MAX_IMAGE_DIMENSION = 2048; // Maximum width/height for images
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf"];

async function ensureBucketExists(client: SupabaseClient) {
	const { data: buckets } = await client.storage.listBuckets();
	const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

	if (!bucketExists) {
		const { error } = await client.storage.createBucket(BUCKET_NAME, {
			public: true,
			fileSizeLimit: MAX_FILE_SIZE,
			allowedMimeTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES],
		});

		if (error) {
			throw error;
		}
	}
}

type UploadParams = {
	file: File;
	path: string[];
};

async function optimizeImage(file: File): Promise<Buffer> {
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	const image = sharp(buffer, {
		failOn: 'none', // Continue processing even with minor errors
		density: 300 // Ensure high-quality processing for text and details
	});

	const metadata = await image.metadata();

	// Resize if image is too large while maintaining aspect ratio
	if ((metadata.width && metadata.width > MAX_IMAGE_DIMENSION) ||
		(metadata.height && metadata.height > MAX_IMAGE_DIMENSION)) {
		image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
			fit: 'inside',
			withoutEnlargement: true,
			kernel: 'lanczos3' // High-quality resampling
		});
	}

	// Optimize for immediate readability while maintaining quality
	return image
		.webp({
			quality: 90, // Higher quality for better readability
			lossless: false,
			force: true,
			effort: 4, // Balanced compression effort
			nearLossless: true, // Better quality preservation
			mixed: true // Optimize for both images and text
		})
		.toBuffer();
}

async function validateFile(file: File) {
	if (file.size > MAX_FILE_SIZE) {
		throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
	}

	if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_DOC_TYPES.includes(file.type)) {
		throw new Error('Unsupported file type');
	}
}

export async function upload(
	client: SupabaseClient,
	{ file, path }: UploadParams,
) {
	// Validate file before processing
	await validateFile(file);

	// Ensure bucket exists before upload
	await ensureBucketExists(client);

	const storage = client.storage.from(BUCKET_NAME);

	// Optimize image if it's an image file
	let uploadData: File | Buffer = file;
	if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
		uploadData = await optimizeImage(file);
	}

	const result = await storage.upload(path.join("/"), uploadData, {
		upsert: true,
		cacheControl: "max-age=31536000", // Cache for 1 year
	});

	if (!result.error) {
		return storage.getPublicUrl(path.join("/")).data.publicUrl;
	}

	throw result.error;
}

type RemoveParams = {
	path: string[];
};

export async function remove(
	client: SupabaseClient,
	{ path }: RemoveParams,
) {
	const storage = client.storage.from(BUCKET_NAME);
	const { error } = await storage.remove([path.join("/")]);

	if (error) {
		throw error;
	}
}

// Cleanup function to remove unused files
export async function cleanupUnusedFiles(
	client: SupabaseClient,
	usedFiles: string[],
) {
	const storage = client.storage.from(BUCKET_NAME);
	const { data: files, error } = await storage.list();

	if (error) {
		throw error;
	}

	const unusedFiles = files
		.filter(file => !usedFiles.includes(file.name))
		.map(file => file.name);

	if (unusedFiles.length > 0) {
		await storage.remove(unusedFiles);
	}

	return unusedFiles.length;
}

type DownloadParams = {
	path: string;
};

export async function download(
	client: SupabaseClient,
	{ path }: DownloadParams,
) {
	return client.storage.from(BUCKET_NAME).download(path);
}

type ShareParams = {
	path: string;
	expireIn: number;
	options?: {
		download?: boolean;
	};
};

export async function share(
	client: SupabaseClient,
	{ path, expireIn, options }: ShareParams,
) {
	return client.storage
		.from(BUCKET_NAME)
		.createSignedUrl(path, expireIn, options);
}
