import { createServerComponentClient, createServerActionClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

// For use in Server Components
export async function createServerClient() {
	const cookieStore = cookies();
	const supabase = createServerComponentClient<Database>({
		cookies: () => cookieStore,
	});

	try {
		const [
			{ data: { session } },
			{ data: { user } }
		] = await Promise.all([
			supabase.auth.getSession(),
			supabase.auth.getUser()
		]);

		return { supabase, session, user };
	} catch (error) {
		console.error("Error in createServerClient:", error);
		return { supabase, session: null, user: null };
	}
}

// For use in Route Handlers
export async function createRouteHandler() {
	const cookieStore = await cookies();
	return createRouteHandlerClient<Database>({
			cookies: () => cookieStore,
	});
}

// For use in Server Actions
export async function createActionClient() {
	const cookieStore = await cookies();
	return createServerActionClient<Database>({
		cookies: () => cookieStore,
	});
}

// Export a default server client for convenience
export const createClient = createServerClient;
