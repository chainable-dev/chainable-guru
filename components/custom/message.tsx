"use client";

import { Message } from "ai";
import cx from "classnames";
import { motion } from "framer-motion";
import { FileIcon, MoreVertical, WalletIcon } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

import { Vote } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWalletState } from "@/hooks/useWalletState";

import { UIBlock } from "./block";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

interface StreamingResponse {
	type: 'intermediate' | 'final';
	content: string;
	data?: any;
}

const ImageWithFallback = ({ src, alt, ...props }: { src: string; alt: string; width: number; height: number; className?: string }) => {
	const [error, setError] = useState(false);

	if (error) {
		return (
			<div className="flex items-center justify-center border rounded-2xl bg-muted/50 p-4" style={{ width: props.width, height: props.height }}>
				<p className="text-sm text-muted-foreground">Failed to load image</p>
			</div>
		);
	}

	return (
		<div className="relative aspect-square rounded-2xl overflow-hidden shadow-sm">
			<Image
				src={src}
				alt={alt}
				{...props}
				onError={() => setError(true)}
				className={cx("object-cover hover:scale-105 transition-transform duration-300", props.className)}
			/>
		</div>
	);
};

export const PreviewMessage = ({
	chatId,
	message,
	block,
	setBlock,
	vote,
	isLoading,
	streamingResponse,
}: {
	chatId: string;
	message: Message;
	block: UIBlock;
	setBlock: Dispatch<SetStateAction<UIBlock>>;
	vote: Vote | undefined;
	isLoading: boolean;
	streamingResponse?: StreamingResponse;
}) => {
	const [showActions, setShowActions] = useState(false);
	const { isConnected, networkInfo, isCorrectNetwork } = useWalletState();

	const renderContent = () => {
		try {
			if (streamingResponse && isLoading) {
				return (
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
							<p className="text-muted-foreground">Thinking...</p>
						</div>
						{streamingResponse.content && (
							<div className="prose dark:prose-invert max-w-none">
								<Markdown>{streamingResponse.content}</Markdown>
							</div>
						)}
					</div>
				);
			}

			const content = JSON.parse(message.content);
			const isWalletMessage = content.text?.toLowerCase().includes('wallet') || 
				content.text?.toLowerCase().includes('balance');

			return (
				<div className="space-y-2">
					{content.text && (
						<div className="flex flex-col gap-2">
							<p className="whitespace-pre-wrap leading-relaxed">{content.text}</p>
							{isWalletMessage && (
								<div className="flex items-center gap-2 text-sm">
									<WalletIcon className="h-4 w-4" />
									{isConnected ? (
										<span className={cx(
											"font-medium",
											isCorrectNetwork ? "text-green-500" : "text-yellow-500"
										)}>
											Connected to {networkInfo?.name || "Unknown Network"}
											{!isCorrectNetwork && " (Unsupported Network)"}
										</span>
									) : (
										<span className="text-muted-foreground">
											Wallet not connected
										</span>
									)}
								</div>
							)}
						</div>
					)}
					{content.attachments && content.attachments.length > 0 && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
							{content.attachments.map((att: any, index: number) => (
								<div key={index} className="relative group">
									{att.type.startsWith("image/") ? (
										<ImageWithFallback
											src={att.url}
											alt={att.name || 'Attached image'}
											width={300}
											height={300}
											className="w-full h-auto"
										/>
									) : (
										<div className="flex items-center gap-3 p-3 border rounded-2xl bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors duration-200">
											<FileIcon className="size-5 text-primary" />
											<span className="text-sm font-medium truncate">{att.name}</span>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			);
		} catch {
			return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
		}
	};

	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 py-2 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			data-role={message.role}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}
		>
			<div
				className={cx(
					"flex gap-4 rounded-2xl relative transition-shadow duration-200",
					message.role === "user" ? 
					"bg-primary text-primary-foreground px-5 py-3 w-fit ml-auto max-w-2xl shadow-sm hover:shadow-md" : 
					"bg-muted/50 hover:bg-muted/80 px-5 py-3 w-full max-w-2xl shadow-sm"
				)}
			>
				{message.role === "assistant" && (
					<div className="size-8 flex items-center rounded-xl justify-center ring-1 shrink-0 ring-border bg-background/50 backdrop-blur-sm">
						<SparklesIcon size={14} className="text-primary" />
					</div>
				)}

				<div className="flex flex-col gap-2 w-full">
					<div className="prose dark:prose-invert max-w-none">
						{renderContent()}
					</div>

					{message.toolInvocations && message.toolInvocations.length > 0 && (
						<div className="flex flex-col gap-4">
							{message.toolInvocations.map((toolInvocation) => {
								const { toolName, toolCallId, state, args } = toolInvocation;

								if (state === "result") {
									const { result } = toolInvocation;

									return (
										<div key={toolCallId} className="rounded-2xl overflow-hidden">
											{toolName === "getWeather" ? (
												<Weather weatherAtLocation={result} />
											) : toolName === "createDocument" ? (
												<DocumentToolResult
													type="create"
													result={result}
													block={block}
													setBlock={setBlock}
												/>
											) : toolName === "updateDocument" ? (
												<DocumentToolResult
													type="update"
													result={result}
													block={block}
													setBlock={setBlock}
												/>
											) : toolName === "requestSuggestions" ? (
												<DocumentToolResult
													type="request-suggestions"
													result={result}
													block={block}
													setBlock={setBlock}
												/>
											) : (
												<pre className="bg-background/50 p-4 rounded-2xl overflow-x-auto">
													{JSON.stringify(result, null, 2)}
												</pre>
											)}
										</div>
									);
								} else {
									return (
										<div
											key={toolCallId}
											className={cx("rounded-2xl overflow-hidden", {
												skeleton: ["getWeather"].includes(toolName),
											})}
										>
											{toolName === "getWeather" ? (
												<Weather />
											) : toolName === "createDocument" ? (
												<DocumentToolCall type="create" args={args} />
											) : toolName === "updateDocument" ? (
												<DocumentToolCall type="update" args={args} />
											) : toolName === "requestSuggestions" ? (
												<DocumentToolCall
													type="request-suggestions"
													args={args}
												/>
											) : null}
										</div>
									);
								}
							})}
						</div>
					)}

					<MessageActions
						key={`action-${message.id}`}
						chatId={chatId}
						message={message}
						vote={vote}
						isLoading={isLoading}
					/>
				</div>

				{message.role === "user" && showActions && (
					<div className="absolute -right-12 top-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button 
									variant="ghost" 
									size="icon" 
									className="h-8 w-8 rounded-xl hover:bg-background/80"
								>
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="rounded-xl">
								<DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
									Copy message
								</DropdownMenuItem>
								<DropdownMenuItem className="text-destructive">
									Delete message
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export const ThinkingMessage = () => {
	const role = "assistant";

	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
			data-role={role}
		>
			<div
				className={cx(
					"flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
					{
						"group-data-[role=user]/message:bg-muted": true,
					},
				)}
			>
				<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
					<SparklesIcon size={14} />
				</div>

				<div className="flex flex-col gap-2 w-full">
					<div className="flex flex-col gap-4 text-muted-foreground">
						Thinking...
					</div>
				</div>
			</div>
		</motion.div>
	);
};
