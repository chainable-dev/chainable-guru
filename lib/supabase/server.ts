import { createServerComponentClient, createServerActionClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";

// Helper function to convert cookies to the format Supabase expects
function cookiesToObject(cookies: RequestCookie[]) {
	const cookieObject: { [key: string]: string } = {};
	cookies.forEach(cookie => {
		cookieObject[cookie.name] = cookie.value;
	});
	return cookieObject;
}

// For use in Server Components
export async function createServerClient() {
	const cookieStore = await cookies();
	const allCookies = cookieStore.getAll();
	
	const supabase = createServerComponentClient<Database>({
		cookies: () => Promise.resolve(cookieStore)
	});

	try {
		const [{ data: { session } }, { data: { user } }] = await Promise.all([
			supabase.auth.getSession(),
			supabase.auth.getUser()
		]);
		
		return { supabase, session, user };
	} catch (error) {
		console.error('Error creating server client:', error);
		return { supabase, session: null, user: null };
	}
}

// For use in Route Handlers
export async function createRouteHandler() {
	const cookieStore = await cookies();
	
	return createRouteHandlerClient<Database>({
		cookies: () => Promise.resolve(cookieStore)
	});
}

// For use in Server Actions 
export async function createActionClient() {
	const cookieStore = await cookies();
	
	return createServerActionClient<Database>({
		cookies: () => Promise.resolve(cookieStore)
	});
}

// Export a default server client for convenience
export const createClient = createServerClient;
