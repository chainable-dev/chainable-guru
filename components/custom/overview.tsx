import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const quotes = [
	"Building bridges in the Web3 ecosystem, one transaction at a time",
	"Empowering developers with seamless blockchain integration",
	"Simplifying complexity in the world of decentralized applications",
	"Where innovation meets blockchain technology",
	"Your trusted companion in the blockchain journey",
];

export function Overview({ messages = [] }: { messages?: any[] }) {
	if (messages.length > 0) {
		return (
			<div className="space-y-4 p-4">
				{messages.map((message, index) => (
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

	return (
		<div className="mx-auto max-w-2xl px-4">
			<div className="rounded-lg border bg-background p-8">
				<h1 className="mb-2 text-lg font-semibold">
					Welcome to AI Chat Bot
				</h1>
				<p className="mb-2 leading-normal text-muted-foreground">
					This is a chat bot built with Next.js and OpenAI.
				</p>
				<p className="leading-normal text-muted-foreground">
					You can start a conversation below.
				</p>
			</div>
		</div>
	);
}
