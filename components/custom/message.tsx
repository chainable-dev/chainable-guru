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
					{/* Render text content if present */}
					{content.text && (
						<div className="whitespace-pre-wrap leading-relaxed">
							<Markdown>{content.text}</Markdown>
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
