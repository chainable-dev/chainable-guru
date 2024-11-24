"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signInWithGoogle } from "@/db/auth";
import { Icons } from "@/components/ui/icons";

export default function RegisterPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const router = useRouter();

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;

			await signUp(email, password);
			setIsTransitioning(true);
			router.push("/");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message);
			setIsLoading(false);
		}
	}

	async function handleGoogleSignIn() {
		setIsLoading(true);
		try {
			await signInWithGoogle();
			setIsTransitioning(true);
			router.push("/");
			router.refresh();
		} catch (error: any) {
			toast.error(error.message);
			setIsLoading(false);
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
		<div className="container flex h-screen w-screen flex-col items-center justify-center">
			<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
				<div className="flex flex-col space-y-2 text-center">
					<h1 className="text-2xl font-semibold tracking-tight">
						Create an account
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your details to get started
					</p>
				</div>

				<div className="grid gap-6">
					<form onSubmit={handleSubmit}>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									placeholder="name@example.com"
									type="email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect="off"
									disabled={isLoading}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									disabled={isLoading}
								/>
							</div>
							<Button disabled={isLoading}>
								{isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
								Create Account
							</Button>
						</div>
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

					<Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
						{isLoading ? (
							<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Icons.google className="mr-2 h-4 w-4" />
						)}
						Google
					</Button>
				</div>

				<p className="px-8 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link href="/login" className="underline underline-offset-4 hover:text-primary">
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
