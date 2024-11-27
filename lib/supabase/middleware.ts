import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
	try {
		// Create response early to ensure consistent cookie handling
		const response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					get(name: string) {
						return request.cookies.get(name)?.value;
					},
					set(name: string, value: string, options: any) {
						response.cookies.set({ name, value, ...options });
					},
					remove(name: string, options: any) {
						response.cookies.set({ name, value: "", ...options });
					},
				},
			}
		);

		// Refresh session if it exists
		const { data: { session }, error: sessionError } = await supabase.auth.getSession();

		// Protected routes that require authentication
		const protectedPaths = ["/admin", "/queue"];
		const isProtectedPath = protectedPaths.some(path => 
			request.nextUrl.pathname.startsWith(path)
		);

		if (isProtectedPath && (!session || sessionError)) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		// Auth pages (login, register) should redirect to home if user is logged in
		const authPaths = ["/login", "/register"];
		if (authPaths.includes(request.nextUrl.pathname) && session) {
			return NextResponse.redirect(new URL("/", request.url));
		}

		// Special case for root path
		if (request.nextUrl.pathname === "/" && (!session || sessionError)) {
			return NextResponse.redirect(new URL("/register", request.url));
		}

		return response;
	} catch (e) {
		console.error("Middleware error:", e);
		
		// For auth-related paths, we should still redirect to maintain security
		if (request.nextUrl.pathname.startsWith("/admin") || 
			request.nextUrl.pathname.startsWith("/queue")) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
		
		// For other paths, continue but with a new response
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
