import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

export const createClient = () => {
	try {
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

		return createBrowserClient<Database>(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
