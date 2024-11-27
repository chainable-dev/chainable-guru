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
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { Database } from "@/lib/supabase/types";
import { fetcher } from "@/lib/utils";

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
	const [streamingResponse, setStreamingResponse] = useState<StreamingResponse | null>(null);
	const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize();

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

	// Set up streaming response handler
	useEffect(() => {
		const eventSource = new EventSource(`/api/chat/stream?chatId=${id}`);
		
		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === 'intermediate') {
					setStreamingResponse(data);
				} else if (data.type === 'final') {
					setStreamingResponse(null);
				}
			} catch (error) {
				console.error('Error parsing streaming response:', error);
			}
		};

		return () => {
			eventSource.close();
		};
	}, [id]);

	return (
		<div className="flex h-full flex-col">
			<ChatHeader selectedModelId={selectedModelId} />
			<div className="flex-1 overflow-y-auto">
				<Overview messages={messages} />
			</div>
			<div className="border-t p-4">
				<MultimodalInput
					input={input}
					setInput={setInput}
					isLoading={isLoading}
					stop={stop}
					messages={messages}
					setMessages={setMessages}
					append={append}
					handleSubmit={handleSubmit}
					chatId={id}
				/>
			</div>
		</div>
	);
}
