import { createClient } from "@/lib/supabase/server";
import type { Session, User } from "@/types/session";

export async function getSession(): Promise<Session | null> {
	const supabase = await createClient();
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error || !session) {
		return null;
	}

	return {
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.user_metadata?.full_name,
			avatar_url: session.user.user_metadata?.avatar_url,
			wallet_address: session.user.user_metadata?.wallet_address,
		},
		expires: session.expires_at?.toString() || "",
	};
}
