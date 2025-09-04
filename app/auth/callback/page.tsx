"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleAuthCallback = async () => {
			const supabase = createClient();

			// Handle OAuth code exchange (for OAuth providers)
			const code = searchParams.get("code");
			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (error) {
					console.error("OAuth callback error:", error);
					router.push("/auth-error");
					return;
				}
				router.push("/");
				return;
			}

			// Handle magic link tokens (from URL hash)
			const hashParams = new URLSearchParams(window.location.hash.substring(1));
			const accessToken = hashParams.get("access_token");
			const refreshToken = hashParams.get("refresh_token");
			const error = hashParams.get("error");
			const errorDescription = hashParams.get("error_description");

			if (error) {
				console.error("Magic link error:", error, errorDescription);
				router.push("/auth-error");
				return;
			}

			if (accessToken && refreshToken) {
				// Set the session with the tokens from the magic link
				const { error: sessionError } = await supabase.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				});

				if (sessionError) {
					console.error("Session error:", sessionError);
					router.push("/auth-error");
					return;
				}

				// Clear the URL hash
				window.history.replaceState({}, document.title, window.location.pathname);
				
				// Redirect to the main application
				router.push("/");
				return;
			}

			// If no code or tokens, redirect to login
			router.push("/login");
		};

		handleAuthCallback();
	}, [router, searchParams]);

	return (
		<div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
			<div className="space-y-4 text-center">
				<Loader2 className="h-8 w-8 animate-spin mx-auto" />
				<p className="text-sm text-muted-foreground">Completing authentication...</p>
			</div>
		</div>
	);
}
