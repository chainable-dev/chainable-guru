import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
	try {
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		// Check if we're in development mode and Supabase is not configured
		const isDevelopment = process.env.NODE_ENV === 'development';
		const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
		
		// If in development and no Supabase config, allow access to all routes
		if (isDevelopment && !hasSupabaseConfig) {
			console.log('Development mode: Bypassing authentication (no Supabase config)');
			return response;
		}

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll();
					},
					setAll(cookiesToSet) {
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value),
						);
						response = NextResponse.next({
							request,
						});
						cookiesToSet.forEach(({ name, value, options }) =>
							response.cookies.set(name, value, options),
						);
					},
				},
			},
		);

		const user = await supabase.auth.getUser();

		// Protected routes
		if (request.nextUrl.pathname === "/" && user.error) {
			return NextResponse.redirect(new URL("/register", request.url));
		}

		// Redirect logged in users from auth pages
		if (
			(request.nextUrl.pathname === "/login" ||
				request.nextUrl.pathname === "/register") &&
			!user.error
		) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		return response;
	} catch (e) {
		// If there's an error and we're in development, allow access
		if (process.env.NODE_ENV === 'development') {
			console.log('Development mode: Allowing access due to Supabase error:', e);
			return NextResponse.next({
				request: {
					headers: request.headers,
				},
			});
		}
		
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
