"use client";

import type { Message } from "ai";
import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { ModernIcons } from "./modern-icons";
import Image from "next/image";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { Vote } from "@/lib/supabase/types";

import { UIBlock } from "./block";
import { DocumentToolCall, DocumentToolResult } from "./document";
import { Markdown } from "./markdown";
import { MessageActions } from "./message-actions";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";

interface ModernMessageProps {
	chatId: string;
	message: Message;
	block: UIBlock;
	setBlock: Dispatch<SetStateAction<UIBlock>>;
	vote: Vote | undefined;
	isLoading: boolean;
}

export const ModernMessage = ({
	chatId,
	message,
	block,
	setBlock,
	vote,
	isLoading,
}: ModernMessageProps) => {
	const [showTimestamp, setShowTimestamp] = useState(false);
	const isUser = message.role === "user";
	const isAssistant = message.role === "assistant";

	const renderContent = () => {
		try {
			const content = JSON.parse(message.content);
			return (
				<div className="space-y-2">
					{content.text && (
						<div className="whitespace-pre-wrap break-words">
							{isAssistant ? (
								<Markdown content={content.text} />
							) : (
								<p>{content.text}</p>
							)}
						</div>
					)}
					{content.attachments && content.attachments.length > 0 && (
						<div className="flex flex-wrap gap-2 mt-2">
							{content.attachments.map((att: any, index: number) => (
								<div key={index}>
									{att.type.startsWith("image/") ? (
										<Image
											src={att.url}
											alt={att.name}
											width={200}
											height={200}
											className="rounded-lg object-cover max-w-full h-auto"
										/>
									) : (
										<div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
											<FileIcon className="size-4" />
											<span className="text-sm">{att.name}</span>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			);
		} catch {
			return (
				<div className="whitespace-pre-wrap break-words">
					{isAssistant ? (
						<Markdown content={message.content} />
					) : (
						<p>{message.content}</p>
					)}
				</div>
			);
		}
	};

	const getMessageStatus = () => {
		if (isUser) {
			if (isLoading) return "sending";
			return "delivered";
		}
		return null;
	};

	const renderMessageStatus = () => {
		const status = getMessageStatus();
		if (!status) return null;

		return (
			<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
				{status === "sending" && <ModernIcons.Clock size={12} />}
				{status === "delivered" && <ModernIcons.Check size={12} />}
				{status === "read" && <ModernIcons.CheckCheck size={12} />}
			</div>
		);
	};

	return (
		<motion.div
			className="w-full max-w-4xl mx-auto px-4 py-2 group/message"
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			onHoverStart={() => setShowTimestamp(true)}
			onHoverEnd={() => setShowTimestamp(false)}
		>
			<div className={cx(
				"flex gap-3 max-w-[85%]",
				isUser ? "ml-auto flex-row-reverse" : "mr-auto"
			)}>
				{/* Avatar */}
				<div className={cx(
					"flex-shrink-0 size-8 rounded-full flex items-center justify-center",
					isUser 
						? "bg-primary text-primary-foreground" 
						: "bg-muted border border-border"
				)}>
					{isUser ? (
						<ModernIcons.User size={16} />
					) : (
						<ModernIcons.Bot size={16} />
					)}
				</div>

				{/* Message Content */}
				<div className={cx(
					"flex flex-col gap-1 min-w-0",
					isUser ? "items-end" : "items-start"
				)}>
					{/* Message Bubble */}
					<div className={cx(
						"relative px-4 py-2 rounded-2xl shadow-sm",
						"transition-all duration-200",
						isUser 
							? "bg-primary text-primary-foreground rounded-br-md" 
							: "bg-muted text-foreground rounded-bl-md border border-border/50",
						"hover:shadow-md"
					)}>
						{/* Message Content */}
						<div className="prose prose-sm dark:prose-invert max-w-none">
							{renderContent()}
						</div>

						{/* Tool Invocations */}
						{message.toolInvocations && message.toolInvocations.length > 0 && (
							<div className="flex flex-col gap-4 mt-3">
								{message.toolInvocations.map((toolInvocation) => {
									const { toolName, toolCallId, state, args } = toolInvocation;

									if (state === "result") {
										const { result } = toolInvocation;

										return (
											<div key={toolCallId} className="border-t border-border/20 pt-3">
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
													<pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
														{JSON.stringify(result, null, 2)}
													</pre>
												)}
											</div>
										);
									} else {
										return (
											<div
												key={toolCallId}
												className={cx(
													"border-t border-border/20 pt-3",
													{ skeleton: ["getWeather"].includes(toolName) }
												)}
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
					</div>

					{/* Message Actions & Status */}
					<div className={cx(
						"flex items-center gap-2 opacity-0 group-hover/message:opacity-100 transition-opacity",
						isUser ? "flex-row-reverse" : "flex-row"
					)}>
						{/* Message Actions */}
						<MessageActions
							key={`action-${message.id}`}
							chatId={chatId}
							message={message}
							vote={vote}
							isLoading={isLoading}
						/>

						{/* Message Status */}
						{renderMessageStatus()}

						{/* Timestamp */}
						<AnimatePresence>
							{showTimestamp && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									className="text-xs text-muted-foreground"
								>
									{new Date().toLocaleTimeString([], { 
										hour: '2-digit', 
										minute: '2-digit' 
									})}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export const ModernThinkingMessage = () => {
	return (
		<motion.div
			className="w-full max-w-4xl mx-auto px-4 py-2"
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
		>
			<div className="flex gap-3 max-w-[85%] mr-auto">
				{/* Avatar */}
				<div className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-muted border border-border">
					<ModernIcons.Bot size={16} />
				</div>

				{/* Thinking Bubble */}
				<div className="bg-muted text-foreground rounded-2xl rounded-bl-md border border-border/50 px-4 py-3 shadow-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<TypingIndicator />
						<span className="text-sm">Thinking...</span>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

const TypingIndicator = () => {
	return <ModernIcons.TypingIndicator size={16} />;
};
