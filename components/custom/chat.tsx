"use client";

import { useChat } from "ai/react";
import type { Message as AIMessage } from "ai";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import { Block, UIBlock } from "@/components/custom/block";
import { BlockStreamHandler } from "@/components/custom/block-stream-handler";
import { ChatHeader } from "@/components/custom/chat-header";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { Overview } from "@/components/custom/overview";
import { Message } from "@/components/custom/message";
import { ThinkingMessage } from "./thinking-message";

import { Database } from "@/lib/supabase/types";
import { fetcher } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import type { ChatMessage, Vote, MessageRole } from "@/types/message";

interface FileUploadState {
	progress: number;
	uploading: boolean;
	error: string | null;
}

export function Chat({
	id,
	initialMessages,
	selectedModelId,
}: {
	id: string;
	initialMessages: Array<AIMessage>;
	selectedModelId: string;
}) {
	const { mutate } = useSWRConfig();
	const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize();
	const chatContainerRef = useRef<HTMLDivElement>(null);

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
		body: { id, modelId: selectedModelId },
		initialMessages,
		onFinish: () => {
			mutate("/api/history");
		},
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

	const { data: votes } = useSWR<Array<Vote>>(`/api/vote?chatId=${id}`, fetcher);
	const [attachments, setAttachments] = useState<Array<any>>([]);
	const [fileUpload, setFileUpload] = useState<FileUploadState>({
		progress: 0,
		uploading: false,
		error: null,
	});

	// Convert AI messages to ChatMessages
	const chatMessages: ChatMessage[] = messages.map(msg => {
		// Filter out unsupported roles
		const role = (['system', 'user', 'assistant', 'function'] as const).includes(msg.role as any) 
			? (msg.role as MessageRole) 
			: 'assistant';

		return {
			id: msg.id,
			role,
			content: msg.content,
			chat_id: id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			vote: votes?.find(v => v.message_id === msg.id)
		};
	});

	// Auto-scroll effect
	useEffect(() => {
		if (!chatContainerRef.current) return;
		
		const scrollToBottom = () => {
			const container = chatContainerRef.current;
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		};

		scrollToBottom();
		const timeoutId = setTimeout(scrollToBottom, 100);
		return () => clearTimeout(timeoutId);
	}, [messages]);

	return (
		<div className="flex flex-col h-dvh bg-background">
			<ChatHeader selectedModelId={selectedModelId} />
			
			<div className="flex-1 flex flex-col">
				<div 
					ref={chatContainerRef}
					className="flex-1 overflow-y-auto flex flex-col-reverse"
				>
					<div className="flex flex-col-reverse gap-6 min-h-full justify-end p-4">
						{messages.length === 0 && <Overview />}

						{chatMessages.map((message, index) => (
							<Message
								key={message.id}
								chatId={id}
								message={message}
								isLoading={isLoading && index === messages.length - 1}
								vote={message.vote}
							/>
						)).reverse()}

						{isLoading && messages.length > 0 && 
						 messages[messages.length - 1].role === "user" && (
							<ThinkingMessage />
						)}
					</div>
				</div>

				<div className="border-t bg-background/80 backdrop-blur-sm">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit(e);
						}}
						className="flex mx-auto px-4 py-4 gap-2 w-full md:max-w-3xl"
					>
						<MultimodalInput
							chatId={id}
							input={input}
							setInput={setInput}
							handleSubmit={handleSubmit}
							isLoading={isLoading}
							stop={stop}
							attachments={attachments}
							setAttachments={setAttachments}
							messages={messages}
							setMessages={setMessages}
							append={append}
						/>
					</form>
				</div>
			</div>

			<AnimatePresence>
				{block.isVisible && (
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
						votes={votes?.map(vote => ({
							chat_id: vote.chat_id,
							message_id: vote.message_id,
							is_upvoted: vote.type === 'up'
						}))}
					/>
				)}
			</AnimatePresence>

			<BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />

			{fileUpload.uploading && (
				<div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
					<Progress value={fileUpload.progress} className="w-full" />
					<p className="text-sm text-muted-foreground mt-2 text-center">
						Uploading... {fileUpload.progress}%
					</p>
				</div>
			)}
		</div>
	);
}
