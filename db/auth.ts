import { createClient } from "@/lib/supabase/client";

export type AuthError = {
	message: string;
	status: number;
};

export async function signIn(email: string, password: string) {
	try {
		const supabase = createClient();
		console.log("Attempting to sign in with email:", email);

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Sign in error:", error);
			throw {
				message: error.message || "Failed to sign in",
				status: error.status || 500,
			} as AuthError;
		}

		console.log("Sign in successful");
		return data;
	} catch (error: any) {
		console.error("Unexpected sign in error:", error);
		throw {
			message: error.message || "An unexpected error occurred",
			status: error.status || 500,
		} as AuthError;
	}
}

export async function signUp(email: string, password: string) {
	try {
		const supabase = createClient();
		console.log("Attempting to sign up with email:", email);

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${location.origin}/auth/callback`,
			},
		});

		if (error) {
			console.error("Sign up error:", error);
			throw {
				message: error.message || "Failed to sign up",
				status: error.status || 500,
			} as AuthError;
		}

		console.log("Sign up successful");
		return data;
	} catch (error: any) {
		console.error("Unexpected sign up error:", error);
		throw {
			message: error.message || "An unexpected error occurred",
			status: error.status || 500,
		} as AuthError;
	}
}

export async function signOut() {
	try {
		const supabase = createClient();
		console.log("Attempting to sign out");

		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Sign out error:", error);
			throw {
				message: error.message || "Failed to sign out",
				status: error.status || 500,
			} as AuthError;
		}

		console.log("Sign out successful");
	} catch (error: any) {
		console.error("Unexpected sign out error:", error);
		throw {
			message: error.message || "An unexpected error occurred",
			status: error.status || 500,
		} as AuthError;
	}
}
