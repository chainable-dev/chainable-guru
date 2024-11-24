import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Database } from "@/types/supabase";

export async function middleware(request: NextRequest) {
	try {
		// Create a response to modify
		const response = NextResponse.next();
		
		// Create the Supabase client
		const supabase = createMiddlewareClient<Database>({ req: request, res: response });

		// Try to refresh the session
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			console.error("[Middleware] Session error:", sessionError);
			// Clear any invalid session data
			await supabase.auth.signOut();
		}

		// Define public routes that don't require authentication
		const publicUrls = [
			"/login",
			"/register",
			"/auth/callback",
			"/reset-password",
			"/forgot-password"
		];

		// Check if the current path is a public URL
		const isPublicUrl = publicUrls.some(url => 
			request.nextUrl.pathname.startsWith(url)
		);

		// For API routes, allow the request to continue
		if (request.nextUrl.pathname.startsWith('/api/')) {
			return response;
		}

		// For public routes, redirect authenticated users to home
		if (isPublicUrl && session) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		// For protected routes, redirect unauthenticated users to login
		if (!isPublicUrl && !session) {
			// Store the original URL to redirect back after login
			const returnUrl = encodeURIComponent(request.nextUrl.pathname);
			return NextResponse.redirect(
				new URL(`/login?returnUrl=${returnUrl}`, request.url)
			);
		}

		// Update session in the response
		return response;

	} catch (error) {
		console.error("[Middleware] Unexpected error:", error);
		
		// In case of error, redirect to login
		return NextResponse.redirect(
			new URL("/login?error=Session expired", request.url)
		);
	}
}

// Configure which routes use this middleware
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes that don't require auth
		 */
		"/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)",
	],
};
