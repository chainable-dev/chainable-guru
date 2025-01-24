"use client";

import { Message } from "ai";
import cx from "classnames";
import { motion } from "framer-motion";
import { FileIcon } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

import { Vote } from "@/lib/supabase/types";

import { UIBlock } from "./block";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

export const PreviewMessage = ({
	chatId,
	message,
	block,
	setBlock,
	vote,
	isLoading,
}: {
	chatId: string;
	message: Message;
	block: UIBlock;
	setBlock: Dispatch<SetStateAction<UIBlock>>;
	vote: Vote | undefined;
	isLoading: boolean;
}) => {
	const renderContent = () => {
		try {
			// First try to parse as JSON
			const content = JSON.parse(message.content);
			
			// If successfully parsed as JSON, render structured content
			return (
				<div className="space-y-3">
					{/* Render wallet state if present */}
					{content.isWalletConnected !== undefined && (
						<motion.div 
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
							className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm"
						>
							<div className="flex items-center gap-2">
								<span className="font-medium">Wallet Status:</span>
								<span className={cx(
									"transition-colors duration-200",
									content.isWalletConnected ? "text-green-500" : "text-red-500"
								)}>
									{content.isWalletConnected ? "Connected" : "Not Connected"}
								</span>
							</div>
							{content.walletAddress && (
								<div className="flex items-center gap-2">
									<span className="font-medium">Address:</span>
									<span className="font-mono bg-muted/30 px-2 py-0.5 rounded select-all">{content.walletAddress}</span>
									{content.isWalletConnected && (
										<a 
											href={`https://basescan.org/address/${content.walletAddress}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline text-xs ml-2"
										>
											View on BaseScan
										</a>
									)}
								</div>
							)}
							{content.network && (
								<div className="flex items-center gap-2">
									<span className="font-medium">Network:</span>
									<span className="bg-muted/30 px-2 py-0.5 rounded">{content.network}</span>
								</div>
							)}
							{content.chainId && (
								<div className="flex items-center gap-2">
									<span className="font-medium">Chain ID:</span>
									<span className="bg-muted/30 px-2 py-0.5 rounded">{content.chainId}</span>
								</div>
							)}
							{content.balance && (
								<div className="flex items-center gap-2">
									<span className="font-medium">Balance:</span>
									<span className="bg-muted/30 px-2 py-0.5 rounded">
										{content.balance} ETH
										{content.ethPrice && (
											<span className="text-xs text-muted-foreground ml-1">
												(${(parseFloat(content.balance) * content.ethPrice).toFixed(2)} USD)
											</span>
										)}
									</span>
								</div>
							)}
							{content.tokens && content.tokens.length > 0 && (
								<div className="mt-2">
									<span className="font-medium">Significant Tokens:</span>
									<div className="mt-1 space-y-1">
										{content.tokens
											.filter(token => token.usdValue >= 1) // Only show tokens worth $1 or more
											.sort((a, b) => b.usdValue - a.usdValue) // Sort by USD value descending
											.map((token, index) => (
												<div key={index} className="flex items-center justify-between bg-muted/30 px-2 py-1 rounded">
													<div className="flex items-center gap-2">
														<span className="font-medium">{token.symbol}</span>
														<span className="text-xs text-muted-foreground">{token.balance}</span>
													</div>
													<span className="text-sm">${token.usdValue.toFixed(2)}</span>
												</div>
											))}
									</div>
								</div>
							)}
						</motion.div>
					)}
					{/* Render text content if present */}
					{content.text && (
						<div className="whitespace-pre-wrap leading-relaxed">
							{content.text.toLowerCase().includes('search firefox') ? (
								<div className="bg-muted/50 p-3 rounded-lg space-y-2 text-sm">
									<div className="flex items-center gap-2">
										<span className="font-medium">Firefox Search:</span>
										<a 
											href={`https://www.firefox.com/search?q=${encodeURIComponent(content.text.replace('search firefox', '').trim())}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{content.text.replace('search firefox', '').trim()}
										</a>
									</div>
								</div>
							) : (
								<Markdown>{content.text}</Markdown>
							)}
						</div>
					)}

					{/* Render attachments if present */}
					{content.attachments && content.attachments.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-2">
							{content.attachments.map((att: { type?: string; url: string; name?: string; base64?: string }, index: number) => (
								<div key={index}>
									{att.type?.startsWith("image/") ? (
										<div className="relative w-[200px] h-[200px] overflow-hidden rounded-lg border">
											<Image
												src={att.base64 ? `data:${att.type};base64,${att.base64}` : att.url}
												alt={att.name || 'Attached image'}
												fill
												className="rounded-lg object-cover hover:scale-105 transition-transform"
												priority
											/>
										</div>
									) : (
										<div className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
											<FileIcon className="size-4" />
											<span className="text-sm">{att.name || 'Attachment'}</span>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			);
		} catch (error) {
			// If not valid JSON, render as markdown
			return (
				<div className="whitespace-pre-wrap">
					<Markdown>{message.content}</Markdown>
				</div>
			);
		}
	};

	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 py-2 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			data-role={message.role}
		>
			<div
				className={cx(
					"group-data-[role=user]/message:bg-primary group-data-[role=user]/message:text-primary-foreground flex gap-4 group-data-[role=user]/message:px-4 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-3 rounded-xl shadow-sm",
				)}
			>
				{message.role === "assistant" && (
					<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
						<SparklesIcon size={14} />
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
										<div key={toolCallId}>
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
												<pre>{JSON.stringify(result, null, 2)}</pre>
											)}
										</div>
									);
								} else {
									return (
										<div
											key={toolCallId}
											className={cx({
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
			</div>
		</motion.div>
	);
};

export const ThinkingMessage = () => {
	const role = "assistant";

	return (
		<motion.div
			className="w-full mx-auto max-w-3xl px-4 py-2 group/message"
			initial={{ y: 5, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
			data-role={role}
		>
			<div
				className="flex gap-4 w-full rounded-xl bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-sm border"
			>
				<div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-muted/50">
					<SparklesIcon size={14} className="text-muted-foreground/70" />
				</div>

				<div className="flex flex-col gap-3 w-full">
					<div className="space-y-3">
						<div className="h-4 w-2/3 bg-muted/60 rounded animate-pulse" />
						<div className="h-4 w-1/2 bg-muted/60 rounded animate-pulse" />
					</div>
				</div>
			</div>
		</motion.div>
	);
};
