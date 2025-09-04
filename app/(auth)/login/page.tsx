"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signInWithGitHub } from "@/lib/auth/client";
import { errorHandler } from "@/lib/error-handling";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [isGitHubLoading, setIsGitHubLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;

			await signIn(email, password);
			setIsTransitioning(true);
			router.push("/");
			router.refresh();
		} catch (error: unknown) {
			errorHandler.showError(error, "user login");
			setIsLoading(false);
		}
	}

	async function handleGitHubLogin() {
		setIsGitHubLoading(true);
		try {
			await signInWithGitHub();
		} catch (error: unknown) {
			errorHandler.showError(error, "GitHub OAuth login");
			setIsGitHubLoading(false);
		}
	}

	if (isTransitioning) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-background">
				<div className="space-y-4 text-center">
					<Loader2 className="h-8 w-8 animate-spin" />
					<p className="text-sm text-muted-foreground">Redirecting...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Login</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Enter your email below to login to your account
					</p>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							placeholder="m@example.com"
							required
							type="email"
							disabled={isLoading}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							required
							type="password"
							disabled={isLoading}
						/>
					</div>
					<Button className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>
				
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>
				</div>

				<Button
					variant="outline"
					className="w-full"
					onClick={handleGitHubLogin}
					disabled={isGitHubLoading || isLoading}
				>
					{isGitHubLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Connecting...
						</>
					) : (
						<>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-label="GitHub logo">
								<path
									fill="currentColor"
									d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
								/>
							</svg>
							Continue with GitHub
						</>
					)}
				</Button>

				<div className="text-center text-sm">
					Don&apos;t have an account?{" "}
					<Link className="underline" href="/register">
						Register
					</Link>
				</div>
			</div>
		</div>
	);
}
