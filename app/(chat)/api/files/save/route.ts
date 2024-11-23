import { NextResponse } from "next/server";

import { saveDocument } from "@/db/mutations";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
	try {
		const { chatId, filePath } = await req.json();

		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Save the file path as a document
		await saveDocument({
			id: chatId,
			title: "File Path",
			content: filePath,
			userId: user.id,
		});

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error: any) {
		console.error("Error saving file path:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
