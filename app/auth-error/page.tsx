"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
	return (
		<div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
			<div className="mx-auto max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<AlertCircle className="mx-auto h-12 w-12 text-destructive" />
					<h1 className="text-2xl font-semibold tracking-tight">
						Authentication Error
					</h1>
					<p className="text-sm text-muted-foreground">
						There was an error during the authentication process. This could be due to:
					</p>
					<ul className="text-sm text-muted-foreground text-left space-y-1 mt-4">
						<li>• Invalid or expired authentication code</li>
						<li>• Network connectivity issues</li>
						<li>• OAuth provider configuration problems</li>
						<li>• User cancelled the authentication process</li>
					</ul>
				</div>
				<div className="space-y-4">
					<Button asChild className="w-full">
						<Link href="/login">
							Try Again
						</Link>
					</Button>
					<Button variant="outline" asChild className="w-full">
						<Link href="/">
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
