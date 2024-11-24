import { createServerComponentClient, createServerActionClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

// For use in Server Components
export async function createServerClient() {
	const cookieStore = cookies();
	
	const supabase = createServerComponentClient<Database>({
		cookies: () => cookieStore
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
export function createRouteHandler() {
	return createRouteHandlerClient<Database>({
		cookies
	});
}

// For use in Server Actions
export function createActionClient() {
	return createServerActionClient<Database>({
		cookies
	});
}

// Export a default server client for convenience
export const createClient = createServerClient;
