import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Generate unique filename
		const filename = `${Date.now()}-${file.name}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage
			.from("chat-uploads")
			.upload(filename, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			console.error("Supabase upload error:", error);
			return NextResponse.json({ error: "Upload failed" }, { status: 500 });
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from("chat-uploads").getPublicUrl(data.path);

		return NextResponse.json({ url: publicUrl });
	} catch (error) {
		console.error("Upload handler error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
