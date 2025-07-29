"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
	return (
		<div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
			<div className="w-full max-w-sm space-y-6 text-center">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-red-600">Authentication Error</h1>
					<p className="text-gray-500 dark:text-gray-400">
						There was an error during authentication. Please try again.
					</p>
				</div>
				<div className="space-y-4">
					<Button asChild className="w-full">
						<Link href="/login">Go to Login</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link href="/register">Go to Register</Link>
					</Button>
				</div>
			</div>
		</div>
	);
} 