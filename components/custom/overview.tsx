"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}

export function Overview({ messages = [] }: { messages?: Message[] }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	if (messages.length === 0) {
		return (
			<div className="mx-auto max-w-2xl px-4">
				<div className="rounded-lg border bg-background p-8">
					<h1 className="mb-2 text-lg font-semibold">
						Welcome to Elron
					</h1>
					<p className="mb-2 leading-normal text-muted-foreground">
						This is an AI chatbot that integrates with blockchain technologies.
					</p>
					<p className="leading-normal text-muted-foreground">
						You can start a conversation below.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 p-4">
			{messages.map((message) => (
				<div
					key={message.id}
					className={cn(
						"flex w-full items-start gap-4 p-4",
						message.role === "assistant" ? "bg-muted/50" : "bg-background"
					)}
				>
					<div className="flex-1">
						<div className="prose prose-neutral dark:prose-invert max-w-none">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{message.content}
							</ReactMarkdown>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
