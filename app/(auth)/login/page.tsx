"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/db/auth";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;

			await signIn(email, password);
			router.push("/");
			router.refresh();
		} catch (error: any) {
			console.error("Login error:", error);
			toast.error(error.message || "Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center py-10">
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
