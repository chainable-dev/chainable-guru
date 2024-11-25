"use client";

import { motion } from "framer-motion";

export function ChatSkeleton() {
	return (
		<div className="flex flex-col space-y-4 p-4">
			<div className="flex gap-4 items-start">
				<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
					<div className="space-y-2">
						<div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
						<div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
					</div>
				</div>
			</div>
		</div>
	);
}
