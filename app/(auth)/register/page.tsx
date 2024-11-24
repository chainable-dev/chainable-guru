"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signInWithGoogle } from "@/db/auth";

export default function RegisterPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

	async function handleGoogleSignIn() {
		setIsGoogleLoading(true);
		try {
			await signInWithGoogle();
		} catch (error: any) {
			toast.error(error.message);
			setIsGoogleLoading(false);
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
								Registering...
							</>
						) : (
							"Register"
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
					type="button"
					disabled={isGoogleLoading}
					onClick={handleGoogleSignIn}
					className="w-full"
				>
					{isGoogleLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<FcGoogle className="mr-2 h-4 w-4" />
					)}
					Google
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
