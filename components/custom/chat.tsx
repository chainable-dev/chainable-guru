"use client";

import { useChat } from "ai/react";
import type { Message, Attachment } from "ai";
import { AnimatePresence } from "framer-motion";
import { KeyboardIcon } from "lucide-react";
import { useState, useEffect, type ClipboardEvent } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import { Block, UIBlock } from "@/components/custom/block";
import { BlockStreamHandler } from "@/components/custom/block-stream-handler";
import { ChatHeader } from "@/components/custom/chat-header";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { Overview } from "@/components/custom/overview";
import { PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ThinkingMessage } from "./thinking-message";

import { Database } from "@/lib/supabase/types";
import { fetcher } from "@/lib/utils";
import { useWalletState } from "@/hooks/useWalletState";

type Vote = Database["public"]["Tables"]["votes"]["Row"];

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
	initialMessages: Array<Message>;
	selectedModelId: string;
}) {
	const { mutate } = useSWRConfig();
	const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize();
	const { address, isConnected, chainId, networkInfo, isCorrectNetwork } = useWalletState();

	// Initialize chat hook first
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
		initialMessages: [
			{
				id: 'system-wallet-info',
				role: 'system',
				content: JSON.stringify({
					text: 'Initializing chat with wallet information',
					walletAddress: address,
					chainId,
					network: networkInfo?.name,
					isWalletConnected: isConnected,
					isCorrectNetwork
				})
			},
			...initialMessages
		],
		onFinish: () => {
			mutate('/api/history');
		},
	});

	// Update messages when wallet state changes after chat initialization
	useEffect(() => {
		if (!setMessages) return; // Guard against undefined setMessages

		const walletStateMessage = {
			id: `wallet-state-${Date.now()}`,
			role: 'system',
			content: JSON.stringify({
				text: 'Wallet state updated',
				walletAddress: address,
				chainId,
				network: networkInfo?.name,
				isWalletConnected: isConnected,
				isCorrectNetwork
			})
		};
		setMessages(prev => [...prev, walletStateMessage]);
	}, [address, chainId, networkInfo, isConnected, isCorrectNetwork, setMessages]);

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

	return (
		<>
			<div className="flex flex-col min-w-0 h-dvh bg-background">
				<ChatHeader selectedModelId={selectedModelId} />
				<div
					ref={messagesContainerRef}
					className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
				>
					{messages.length === 0 && <Overview />}

					{isLoading &&
						messages.length > 0 &&
						messages[messages.length - 1].role === "user" && (
							<ThinkingMessage />
						)}

					{messages.map((message, index) => (
						<PreviewMessage
							key={message.id}
							chatId={id}
							message={message}
							block={block}
							setBlock={setBlock}
							isLoading={isLoading && messages.length - 1 === index}
							vote={votes?.find((vote) => vote.message_id === message.id)}
						/>
					))}

					<div
						ref={messagesEndRef}
						className="shrink-0 min-w-[24px] min-h-[24px]"
					/>
				</div>

				<form
					id="chat-form"
					name="chat-form"
					className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit(e);
					}}
					aria-label="Chat input form"
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

			<div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							className="p-2 rounded-full bg-muted"
							type="button"
							aria-label="Keyboard shortcuts"
						>
							<KeyboardIcon className="size-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-sm">
							<p>⌘ / to focus input</p>
							<p>⌘ K to clear chat</p>
							<p>ESC to stop generation</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</div>

			{fileUpload.uploading && (
				<div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
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
	</>
);
}
