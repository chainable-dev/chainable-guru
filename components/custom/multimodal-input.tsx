"use client";

import cx from "classnames";
import { motion } from "framer-motion";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";

import { useWalletState } from "@/hooks/useWalletState";
import { createClient } from "@/lib/supabase/client";
import { ArrowUpIcon, PaperclipIcon, StopIcon } from "@/components/custom/icons";
import GlobeIcon from "@/components/custom/icons/GlobeIcon";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import type { Attachment } from "@/types/attachments";
import type { Message, ChatRequestOptions } from "ai";

const SUGGESTED_ACTIONS = [
	{
		title: "Create a new document",
		label: "with title",
		action: 'Create a new document with the title "My New Document"',
	},
	{
		title: "Check wallet balance",
		label: "for connected wallet",
		action: "Check the balance of my connected wallet",
	},
	{
		title: "Web search",
		label: "search the web for information",
		action: "Search the web for latest blockchain news",
	},
	{
		title: "Smart contract interaction",
		label: "interact with contracts",
		action: "Show me how to interact with a smart contract",
	},
] as const;

interface StagedFile {
	id: string;
	file: File;
	previewUrl: string;
	status: "staging" | "uploading" | "complete" | "error";
}

interface MultimodalInputProps {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	stop: () => void;
	attachments: Attachment[];
	setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
	messages: Message[];
	append: (message: Message, options?: ChatRequestOptions) => Promise<string | null>;
	chatId: string;
	className?: string;
}

export function MultimodalInput({
	input,
	setInput,
	isLoading,
	stop,
	attachments,
	setAttachments,
	messages,
	append,
	chatId,
	className,
}: MultimodalInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
	const [localInput, setLocalInput] = useLocalStorage("chat-input", "");
	const { isConnected, isCorrectNetwork } = useWalletState();

	// File handling logic
	const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		// ... rest of file handling logic
	}, [chatId, setAttachments]);

	// Add back web search handler
	const handleWebSearch = useCallback(async () => {
		if (!input) return;

		try {
			const response = await fetch(`/api/search?query=${encodeURIComponent(input)}`);
			if (!response.ok) throw new Error("Search failed");

			const data = await response.json();
			
			// Append search results to chat
			await append({
				id: crypto.randomUUID(),
				role: "user",
				content: `Web search results for: ${input}\n\n${JSON.stringify(data, null, 2)}`,
			});
			
			setInput("");
		} catch (error) {
			console.error("Error performing web search:", error);
			toast.error("Failed to perform web search");
		}
	}, [input, append, setInput]);

	// Update message submission logic to include id
	const handleSubmit = useCallback(async () => {
		if (!input && attachments.length === 0) return;
		
		const isWalletQuery = input.toLowerCase().includes("wallet");
		const isWebSearch = input.toLowerCase().includes("search");
		
		if (isWalletQuery && (!isConnected || !isCorrectNetwork)) {
			toast.error("Please connect your wallet and ensure correct network");
			return;
		}

		try {
			if (isWebSearch) {
				await handleWebSearch();
				return;
			}

			await append({
				id: crypto.randomUUID(),
				role: "user",
				content: input,
			}, { experimental_attachments: attachments });
			
			setInput("");
			setAttachments([]);
			setLocalInput("");
		} catch (error) {
			toast.error("Failed to send message");
		}
	}, [input, attachments, append, isConnected, isCorrectNetwork, handleWebSearch]);

	return (
		<div className="relative w-full flex flex-col gap-4">
			{/* Suggested Actions */}
			{messages.length === 0 && (
				<div className="grid sm:grid-cols-2 gap-2">
					{SUGGESTED_ACTIONS.map((action) => (
						<Button
							key={action.title}
							variant="ghost"
							onClick={() => setInput(action.action)}
							className="text-left h-auto py-3"
						>
							<span className="flex flex-col">
								<span className="font-medium">{action.title}</span>
								<span className="text-xs text-muted-foreground">{action.label}</span>
							</span>
						</Button>
					))}
				</div>
			)}

			{/* Attachments Preview */}
			{(attachments.length > 0 || stagedFiles.length > 0) && (
				<div className="flex gap-2 overflow-x-auto pb-2">
					{/* ... attachment previews */}
				</div>
			)}

			{/* Input Area */}
			<div className="relative flex items-end gap-2">
				<Textarea
					ref={textareaRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Send a message..."
					className={cx("min-h-[24px] max-h-[75vh] pr-24 resize-none rounded-xl", className)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							isLoading ? toast.error("Please wait...") : handleSubmit();
						}
					}}
				/>

				{/* Action Buttons */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					<Button
						size="icon"
						variant="outline"
						onClick={handleWebSearch}
						disabled={isLoading || !input}
						className="size-8 rounded-full"
					>
						<GlobeIcon size={16} />
					</Button>

					<Button
						size="icon"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="size-8 rounded-full"
					>
						<PaperclipIcon size={16} />
					</Button>

					<Button
						size="icon"
						variant={input ? "default" : "outline"}
						onClick={() => isLoading ? stop() : handleSubmit()}
						disabled={!input && !attachments.length}
						className="size-8 rounded-full"
					>
						{isLoading ? <StopIcon size={16} /> : <ArrowUpIcon size={16} />}
					</Button>
				</div>
			</div>
		</div>
	);
}
