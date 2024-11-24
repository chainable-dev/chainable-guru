import { createRouteHandler } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { APP_ROUTES, ERROR_MESSAGES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	try {
		const supabase = await createRouteHandler();
		
		if (!code) {
			throw new Error("No code provided");
		}

		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError || !user) {
			throw authError || new Error("No user found");
		}

		// Update profile
		const { error: profileError } = await supabase
			.from("profiles")
			.upsert({
				id: user.id,
				email: user.email,
				full_name: user.user_metadata?.full_name || null,
				avatar_url: user.user_metadata?.avatar_url || null,
				provider: user.app_metadata?.provider || null,
				updated_at: new Date().toISOString(),
			})
			.single();

		if (profileError) {
			console.error("[Auth Callback] Profile error:", profileError);
		}

		return NextResponse.redirect(new URL(APP_ROUTES.APP.HOME, request.url));

	} catch (error) {
		console.error("[Auth Callback] Error:", error);
		return NextResponse.redirect(
			new URL(
				`${APP_ROUTES.AUTH.LOGIN}?error=${encodeURIComponent(ERROR_MESSAGES.AUTH.UNAUTHORIZED)}`,
				request.url
			)
		);
	}
}
