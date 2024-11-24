import { createRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const error = requestUrl.searchParams.get("error");
	const error_description = requestUrl.searchParams.get("error_description");

	console.log("[Auth Callback] Received request:", {
		url: request.url,
		code: code ? "Present" : "Missing",
		error,
		error_description,
	});

	try {
		const supabase = await createRouteHandler();

		if (code) {
			const { data: { session }, error: sessionError } = 
				await supabase.auth.exchangeCodeForSession(code);

			if (sessionError) {
				console.error("[Auth Callback] Session error:", sessionError);
				throw sessionError;
			}

			if (!session?.user) {
				throw new Error("No user in session");
			}

			// Get user metadata from Google
			const { data: { user }, error: userError } = await supabase.auth.getUser();
			
			if (userError) {
				console.error("[Auth Callback] User error:", userError);
				throw userError;
			}

			// Create or update profile with Google info
			const { error: profileError } = await supabase
				.from('profiles')
				.upsert({
					id: user.id,
					email: user.email,
					full_name: user.user_metadata?.full_name,
					avatar_url: user.user_metadata?.avatar_url,
					provider: user.app_metadata?.provider,
					updated_at: new Date().toISOString(),
				}, {
					onConflict: 'id'
				});

			if (profileError) {
				console.error("[Auth Callback] Profile error:", profileError);
			}

			console.log("[Auth Callback] Profile updated:", {
				id: user.id,
				email: user.email,
				provider: user.app_metadata?.provider
			});

			return NextResponse.redirect(new URL("/", requestUrl.origin));
		}

		return NextResponse.redirect(
			new URL("/login?error=No code provided", requestUrl.origin)
		);

	} catch (error) {
		console.error("[Auth Callback] Error:", error);
		return NextResponse.redirect(
			new URL("/login?error=Authentication failed", requestUrl.origin)
		);
	}
}
