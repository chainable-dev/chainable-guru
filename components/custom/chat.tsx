"use client";

import { useChat } from "ai/react";
import type { Message, Attachment } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { KeyboardIcon } from "lucide-react";
import { useState, useEffect, type ClipboardEvent } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cx } from "class-variance-authority";

import { Block, UIBlock } from "@/components/custom/block";
import { BlockStreamHandler } from "@/components/custom/block-stream-handler";
import { ChatHeader } from "@/components/custom/chat-header";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { Overview } from "@/components/custom/overview";
import { PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ThinkingMessage } from "./thinking-message";
import { MessageSkeleton } from "./message-skeleton";
import { ChatSkeleton } from "./chat-skeleton";

import { Database } from "@/lib/supabase/types";
import { fetcher } from "@/lib/utils";
import { IntermediateMessageHandler } from "@/components/custom/intermediate-message-handler";
import { ThoughtProcess, TaskSequence } from "@/types/intermediate-message";
import { generateUUID } from "@/lib/utils";
import type { UIMessage } from "@/types/message";
import { Message as AIMessage } from "ai/react";
import { optimizeMessages, TOKEN_LIMITS } from '@/lib/token-utils';
import { Button } from "@/components/ui/button";

type Vote = Database["public"]["Tables"]["votes"]["Row"];

interface FileUploadState {
	progress: number;
	uploading: boolean;
	error: string | null;
}

interface ChatProps {
	id: string;
	initialMessages: UIMessage[];
	selectedModelId: string;
}

const convertToAIMessage = (message: UIMessage): AIMessage => ({
	id: message.id,
	role: message.role,
	content: message.content,
	createdAt: new Date(message.createdAt),
});

export function Chat({
	id,
	initialMessages,
	selectedModelId,
}: ChatProps) {
	const { mutate } = useSWRConfig();
	const { width: windowWidth = 1920, height: windowHeight = 1080 } =
		useWindowSize();

	const {
		messages,
		setMessages,
		handleSubmit,
		input,
		setInput,
		append,
		isLoading,
		stop,
		data: streamingData,
	} = useChat({
		body: { 
			id, 
			modelId: selectedModelId,
			messages: initialMessages.map(msg => ({
				...convertToAIMessage(msg),
				content: msg.content
			}))
		},
		initialMessages: initialMessages.map(convertToAIMessage),
		onFinish: () => {
			mutate("/api/history");
		}
	});

	const [block, setBlock] = useState<UIBlock>({
		documentId: "init",
		content: "",
		title: "",
		status: "idle",
		isVisible: false,
		boundingBox: {
			top: windowHeight / 4,
			left: windowWidth / 4,
			width: 250,
			height: 50,
		},
	});

	const { data: votes } = useSWR<Array<Vote>>(
		`/api/vote?chatId=${id}`,
		fetcher,
	);

	const [messagesContainerRef, messagesEndRef] =
		useScrollToBottom<HTMLDivElement>();
	const [attachments, setAttachments] = useState<Array<Attachment>>([]);
	const [fileUpload, setFileUpload] = useState<FileUploadState>({
		progress: 0,
		uploading: false,
		error: null,
	});

	const [showOverview, setShowOverview] = useState(true);

	useEffect(() => {
		if (messages.length > 0) {
			setShowOverview(false);
		}
	}, [messages]);

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}

		setFileUpload({ progress: 0, uploading: true, error: null });

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append("file", file);

			xhr.upload.addEventListener("progress", (e) => {
				if (e.lengthComputable) {
					const progress = Math.round((e.loaded * 100) / e.total);
					setFileUpload((prev) => ({ ...prev, progress }));
				}
			});

			xhr.addEventListener("load", () => {
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					toast.success("File uploaded successfully");
					append({
						role: "user",
						content: `[File uploaded: ${file.name}](${response.url})`,
					});
					resolve(response);
				} else {
					setFileUpload((prev) => ({
						...prev,
						error: "Upload failed",
					}));
					toast.error("Failed to upload file");
					reject(new Error("Upload failed"));
				}
				setFileUpload((prev) => ({ ...prev, uploading: false }));
			});

			xhr.addEventListener("error", () => {
				setFileUpload((prev) => ({
					...prev,
					error: "Upload failed",
					uploading: false,
				}));
				toast.error("Failed to upload file");
				reject(new Error("Upload failed"));
			});

			xhr.open("POST", "/api/upload");
			xhr.send(formData);
		});
	};

	const handleThoughtComplete = (thought: ThoughtProcess) => {
		append({
			id: generateUUID(),
			role: "assistant",
			content: `${thought.content}`,
			createdAt: new Date(),
		});
	};

	const handleTaskComplete = (sequence: TaskSequence) => {
		append({
			id: generateUUID(),
			role: "assistant", 
			content: sequence.tasks.map((task) => task.description).join('\n'),
			createdAt: new Date(),
		});
	};

	const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		const currentMessages = messages.map(msg => ({
			role: msg.role,
			content: msg.content
		}));
		
		const maxTokens = TOKEN_LIMITS[selectedModelId as keyof typeof TOKEN_LIMITS] || TOKEN_LIMITS.DEFAULT_MAX_TOKENS;
		const optimizedMessages = optimizeMessages(currentMessages, selectedModelId, maxTokens);
		
		handleSubmit(e, {
			options: {
				body: {
					messages: optimizedMessages
				}
			}
		});
	};

	const handleSuggestedAction = (action: string) => {
		switch (action) {
			case "Upload or paste your code for review":
				document.getElementById('file-upload')?.click();
				break;
			case "Analyze smart contract security":
				setInput("Please analyze this smart contract for security vulnerabilities:\n```solidity\n\n```");
				break;
			case "Get help with development":
				setInput("I need help with ");
				break;
			case "Common development tasks":
				setInput("Help me with ");
				break;
			default:
				setInput(action);
		}
	};

	return (
		<div className="flex flex-col h-dvh bg-background">
			<ChatHeader selectedModelId={selectedModelId} />
			
			<div className="flex-1 w-full max-w-4xl mx-auto px-4 overflow-hidden">
				<div
					ref={messagesContainerRef}
					className="flex flex-col-reverse h-full overflow-y-auto py-4 space-y-reverse space-y-6 scrollbar-thin scrollbar-thumb-muted-foreground/10 scrollbar-track-transparent"
				>
					<div ref={messagesEndRef} className="flex-1" />

					{isLoading && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex bg-muted/30 border-y border-border/40 py-6"
						>
							<div className="max-w-2xl mx-auto w-full">
								{messages.length > 0 && messages[messages.length - 1].role === "user" ? (
									<ThinkingMessage />
								) : (
									<MessageSkeleton />
								)}
							</div>
						</motion.div>
					)}

					{messages.map((message, index) => (
						<motion.div
							key={message.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className={cx(
								"flex py-6",
								message.role === 'assistant' && "bg-muted/30 border-y border-border/40"
							)}
						>
							<div className="max-w-2xl mx-auto w-full">
								<PreviewMessage
									chatId={id}
									message={message}
									block={block}
									setBlock={setBlock}
									isLoading={isLoading && messages.length - 1 === index}
									vote={votes?.find((vote) => vote.message_id === message.id)}
								/>
							</div>
						</motion.div>
					))}

					{showOverview && (
						<div className="max-w-2xl mx-auto">
							<Overview onActionClick={handleSuggestedAction} />
						</div>
					)}
				</div>
			</div>

			<div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="max-w-2xl mx-auto px-4 py-4">
					<form
						id="chat-form"
						name="chat-form"
						className="flex gap-2"
						onSubmit={handleMessageSubmit}
						aria-label="Chat input form"
					>
						<MultimodalInput
							chatId={id}
							input={input}
							setInput={setInput}
							attachments={attachments}
							setAttachments={setAttachments}
							messages={messages}
							setMessages={setMessages}
							append={append}
							isLoading={isLoading}
							stop={stop}
							handleSubmit={handleSubmit}
						/>
					</form>
				</div>
			</div>

			<AnimatePresence>
				{block && block.isVisible && (
					<Block
						chatId={id}
						input={input}
						setInput={setInput}
						handleSubmit={handleSubmit}
						isLoading={isLoading}
						stop={stop}
						attachments={attachments}
						setAttachments={setAttachments}
						append={append}
						block={block}
						setBlock={setBlock}
						messages={messages}
						setMessages={setMessages}
						votes={votes}
					/>
				)}
			</AnimatePresence>

			<BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />

			{fileUpload.uploading && (
				<div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg shadow-lg border border-border/40">
					<Progress value={fileUpload.progress} className="w-full" />
					<p className="text-sm text-muted-foreground mt-2 text-center">
						Uploading... {fileUpload.progress}%
					</p>
				</div>
			)}

			<input
				type="file"
				onChange={(e) => {
					const file = e.target.files?.[0];
					if (file) handleFileUpload(file);
				}}
				className="hidden"
				id="file-upload"
				accept="image/*,.pdf,.doc,.docx,.txt"
			/>

			<IntermediateMessageHandler
				streamingData={streamingData}
				onThoughtComplete={handleThoughtComplete}
				onTaskComplete={handleTaskComplete}
			/>
		</div>
	);
}
