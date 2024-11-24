import { createServerComponentClient, createServerActionClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// For use in Server Components
export async function createServerClient() {
	const cookieStore = cookies();
	const supabase = createServerComponentClient<Database>({
		cookies: () => cookieStore,
	});

	const { data: { session } } = await supabase.auth.getSession();
	const { data: { user } } = await supabase.auth.getUser();

	return { supabase, session, user };
}

// For use in Route Handlers
export function createRouteHandler() {
	const cookieStore = cookies();
	return createRouteHandlerClient<Database>({
		cookies: () => cookieStore,
	});
}

// For use in Server Actions
export function createActionClient() {
	const cookieStore = cookies();
	return createServerActionClient<Database>({
		cookies: () => cookieStore,
	});
}

// Export a default server client for convenience
export const createClient = createServerClient;
