"use client";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MessageProps, VoteType, ChatMessage } from "@/types/message";

export function Message({ 
	message, 
	chatId, 
	isLoading,
	vote 
}: MessageProps) {
	const [isVoting, setIsVoting] = useState(false);
	const isUser = message.role === "user";

	const handleVote = async (type: VoteType) => {
		if (!chatId || isVoting) return;

		try {
			setIsVoting(true);
			Logger.debug('Submitting vote', 'Message', { messageId: message.id, type });

			const response = await fetch("/api/vote", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messageId: message.id,
					chatId,
					type
				}),
			});

			if (!response.ok) throw new Error('Failed to submit vote');
			
			toast.success("Vote submitted successfully");
		} catch (error) {
			Logger.error('Vote submission failed', 'Message', error);
			toast.error("Failed to submit vote");
		} finally {
			setIsVoting(false);
		}
	};

	return (
		<div
			className={cn(
				"flex w-full items-start gap-4 p-4",
				isUser ? "justify-end" : "justify-start",
				isLoading && "opacity-50"
			)}
		>
			<div
				className={cn(
					"flex flex-col rounded-lg px-4 py-2 max-w-[80%]",
					isUser ? "bg-primary text-primary-foreground" : "bg-muted"
				)}
			>
				<p className="text-sm whitespace-pre-wrap break-words">
					{message.content}
				</p>
				
				{!isUser && chatId && (
					<div className="flex items-center gap-2 mt-2 text-muted-foreground">
						<button
							onClick={() => handleVote("up")}
							disabled={isVoting}
							className={cn(
								"p-1 rounded hover:bg-accent",
								vote?.type === "up" && "text-green-500"
							)}
						>
							<ThumbsUp className="w-4 h-4" />
						</button>
						<button
							onClick={() => handleVote("down")}
							disabled={isVoting}
							className={cn(
								"p-1 rounded hover:bg-accent",
								vote?.type === "down" && "text-red-500"
							)}
						>
							<ThumbsDown className="w-4 h-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
