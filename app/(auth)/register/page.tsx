"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signInWithGitHub } from "@/db/auth";

export default function RegisterPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isGitHubLoading, setIsGitHubLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;

			await signUp(email, password);
			toast.success("Check your email to confirm your account");
			router.push("/login");
		} catch (error: any) {
			toast.error(error.message);
		} finally {
			setIsLoading(false);
		}
	}

	async function handleGitHubLogin() {
		setIsGitHubLoading(true);
		try {
			await signInWithGitHub();
		} catch (error: any) {
			toast.error(error.message);
			setIsGitHubLoading(false);
		}
	}

	return (
		<div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
			<div className="w-full max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Register</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Enter your information to create an account
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
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input id="password" name="password" required type="password" />
					</div>
					<Button className="w-full" disabled={isLoading}>
						{isLoading ? "Loading..." : "Register"}
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
							<svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							Connecting...
						</>
					) : (
						<>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
					Already have an account?{" "}
					<Link className="underline" href="/login">
						Login
					</Link>
				</div>
			</div>
		</div>
	);
}
