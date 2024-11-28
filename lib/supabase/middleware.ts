import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
	try {
		let response = NextResponse.next({
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
					set(name: string, value: string, options: { path: string; maxAge?: number; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
						try {
							request.cookies.set({
								name,
								value,
								...options,
							});
							response.cookies.set({
								name,
								value,
								...options,
							});
						} catch (error) {
							console.error("Error setting cookie in middleware:", error);
						}
					},
					remove(name: string, options: { path: string; domain?: string }) {
						try {
							request.cookies.delete(name);
							response.cookies.set({
								name,
								value: "",
								...options,
								maxAge: 0,
							});
						} catch (error) {
							console.error("Error removing cookie in middleware:", error);
						}
					},
				},
			},
		);

		await supabase.auth.getSession();

		return response;
	} catch (error) {
		console.error("Error in updateSession middleware:", error);
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
