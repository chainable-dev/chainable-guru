import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { Database } from "./types";

export const createClient = async () => {
	try {
		const cookieStore = await cookies();

		// Check if Supabase environment variables are configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
			if (process.env.NODE_ENV === 'development') {
				console.log('Development mode: Supabase not configured, returning mock client');
				// Return a mock client that won't throw errors
				return {
					auth: {
						getUser: async () => ({ data: { user: null }, error: null }),
						signInWithPassword: async () => ({ data: { user: null }, error: null }),
						signUp: async () => ({ data: { user: null }, error: null }),
					},
					from: () => ({
						select: () => ({ eq: () => ({ single: async () => null, data: null, error: null }) }),
						insert: () => ({ select: () => ({ single: async () => null, data: null, error: null }) }),
						update: () => ({ eq: () => ({ select: () => ({ single: async () => null, data: null, error: null }) }) }),
						delete: () => ({ eq: async () => ({ data: null, error: null }) }),
					}),
				} as any;
			}
			throw new Error('Supabase environment variables not configured');
		}

		return createServerClient<Database>(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					get(name: string) {
						return cookieStore.get(name)?.value;
					},
				},
			},
		);
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.log('Development mode: Error creating Supabase client, returning mock client:', error);
			// Return a mock client that won't throw errors
			return {
				auth: {
					getUser: async () => ({ data: { user: null }, error: null }),
					signInWithPassword: async () => ({ data: { user: null }, error: null }),
					signUp: async () => ({ data: { user: null }, error: null }),
				},
				from: () => ({
					select: () => ({ eq: () => ({ single: async () => null, data: null, error: null }) }),
					insert: () => ({ select: () => ({ single: async () => null, data: null, error: null }) }),
					update: () => ({ eq: () => ({ select: () => ({ single: async () => null, data: null, error: null }) }) }),
					delete: () => ({ eq: async () => ({ data: null, error: null }) }),
				}),
			} as any;
		}
		throw error;
	}
};
