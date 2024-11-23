"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleLogin() {
		try {
			setIsLoading(true);
			const supabase = createClient();

			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) throw error;
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Failed to login");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-muted to-background">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				className="w-full max-w-md space-y-8"
			>
				{/* Logo and Title */}
				<div className="text-center space-y-4">
					<motion.div
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<Image
							src="/logos/elron.ico"
							alt="Logo"
							width={80}
							height={80}
							className="mx-auto rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
							priority
						/>
					</motion.div>
					<h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
						Welcome to Elron AI
					</h1>
					<p className="text-muted-foreground text-lg">
						Your AI-powered development companion
					</p>
				</div>

				{/* Login Card */}
				<Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
					<CardHeader className="space-y-1 text-center pb-4">
						<h2 className="text-2xl font-semibold">Sign in</h2>
						<p className="text-sm text-muted-foreground">
							Continue with Google to get started
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							className="w-full h-12 text-lg relative group transition-all duration-200 hover:shadow-md"
							onClick={handleLogin}
							disabled={isLoading}
						>
							<motion.div
								className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 rounded-md"
								initial={false}
								animate={{ scale: isLoading ? 1.05 : 1 }}
								transition={{ duration: 0.2 }}
							/>
							<span className="flex items-center justify-center gap-3">
								<Image
									src="/logos/google.svg"
									alt="Google"
									width={24}
									height={24}
									className="size-6"
								/>
								{isLoading ? "Connecting..." : "Continue with Google"}
							</span>
						</Button>
					</CardContent>
				</Card>

				{/* Footer */}
				<footer className="text-center text-sm text-muted-foreground space-y-2">
					<p>
						By signing in, you agree to our{" "}
						<Link href="/terms" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
							Terms of Service
						</Link>{" "}
						and{" "}
						<Link href="/privacy" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
							Privacy Policy
						</Link>
					</p>
					<p>
						Need help?{" "}
						<Link href="/support" className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200">
							Contact Support
						</Link>
					</p>
				</footer>
			</motion.div>
		</div>
	);
}
