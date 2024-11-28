import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
	try {
		const requestUrl = new URL(request.url);
		const code = requestUrl.searchParams.get("code");

		if (code) {
			const supabase = await createClient();
			const { error } = await supabase.auth.exchangeCodeForSession(code);

			if (!error) {
				return NextResponse.redirect(requestUrl.origin);
			}
		}

		// Return the user to an error page with instructions
		return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
	} catch (error) {
		console.error("Error in auth callback:", error);
		return NextResponse.redirect(`${requestUrl.origin}/auth-error`);
	}
}
