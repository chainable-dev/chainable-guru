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
		if (error) {
			console.error("[Auth Callback] OAuth error:", {
				error,
				description: error_description,
			});
			return NextResponse.redirect(
				new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
			);
		}

		if (!code) {
			console.warn("[Auth Callback] No code present in request");
			return NextResponse.redirect(
				new URL("/login?error=No authorization code provided", requestUrl.origin)
			);
		}

		// Initialize Supabase client with proper cookie handling
		console.log("[Auth Callback] Initializing Supabase client");
		const supabase = await createRouteHandler();

		try {
			// Exchange the code for a session
			console.log("[Auth Callback] Exchanging code for session");
			const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

			if (sessionError) {
				console.error("[Auth Callback] Session exchange error:", sessionError);
				throw sessionError;
			}

			if (!session?.user?.id) {
				console.error("[Auth Callback] No user ID in session");
				throw new Error("No user found in session");
			}

			// Log successful authentication
			console.log("[Auth Callback] Authentication successful", {
				userId: session.user.id,
				email: session.user.email,
			});

			// Create or update user profile
			const { error: upsertError } = await supabase
				.from("profiles")
				.upsert(
					{
						id: session.user.id,
						email: session.user.email,
						updated_at: new Date().toISOString(),
					},
					{
						onConflict: "id",
						ignoreDuplicates: false,
					}
				);

			if (upsertError) {
				console.error("[Auth Callback] Profile upsert error:", upsertError);
			}

			// Create response with redirect
			const response = NextResponse.redirect(new URL("/", requestUrl.origin));

			// Log redirect
			console.log("[Auth Callback] Redirecting to home page");
			return response;

		} catch (error) {
			console.error("[Auth Callback] Auth flow error:", error);
			return NextResponse.redirect(
				new URL("/login?error=Authentication failed", requestUrl.origin)
			);
		}

	} catch (error) {
		console.error("[Auth Callback] Unexpected error:", error);
		
		const errorMessage = error instanceof Error 
			? error.message 
			: "Authentication failed";

		return NextResponse.redirect(
			new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
		);
	}
}
