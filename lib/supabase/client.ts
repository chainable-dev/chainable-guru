import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

export const createClient = () => {
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					const cookie = document.cookie
						.split("; ")
						.find((row) => row.startsWith(`${name}=`));
					return cookie ? decodeURIComponent(cookie.split("=")[1]) : undefined;
				},
				set(name: string, value: string, options: { path: string; maxAge?: number; domain?: string; sameSite?: "lax" | "strict" | "none"; secure?: boolean }) {
					let cookie = `${name}=${encodeURIComponent(value)}`;
					if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
					if (options.path) cookie += `; Path=${options.path}`;
					if (options.domain) cookie += `; Domain=${options.domain}`;
					if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
					if (options.secure) cookie += "; Secure";
					document.cookie = cookie;
				},
				remove(name: string, options: { path: string; domain?: string }) {
					document.cookie = `${name}=; Path=${options.path}; Max-Age=0${
						options.domain ? `; Domain=${options.domain}` : ""
					}`;
				},
			},
		}
	);
};
