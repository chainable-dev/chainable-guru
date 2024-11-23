"use client";

import cx from "classnames";
import React, { useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from 'wagmi';
import { 
	ArrowUp,
	Paperclip,
	Square,
	Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { messageAnimationVariants } from "@/lib/animation-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useWalletState } from "@/hooks/useWalletState";
import GlobeIcon from "@/components/custom/icons/GlobeIcon";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { LoadingSkeleton } from "./loading-skeleton";

import type { MultimodalInputProps } from "@/types/chat";

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
		title: "Restaurant recommendations",
		label: "find places to eat",
		action: "Can you recommend some good restaurants nearby?",
	},
	{
		title: "Weather check",
		label: "get weather updates",
		action: "What's the weather like today?",
	},
	{
		title: "Smart contract interaction",
		label: "interact with contracts",
		action: "Show me how to interact with a smart contract",
	},
] as const;

export function MultimodalInput({
	chatId,
	input,
	setInput,
	handleSubmit: formSubmit,
	isLoading,
	stop,
	attachments,
	setAttachments,
	messages,
	setMessages,
	append,
	className,
	webSearchEnabled = true,
}: MultimodalInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [localInput, setLocalInput] = useLocalStorage("chat-input", "");
	const { isConnected, isCorrectNetwork } = useWalletState();
	const { address } = useAccount();
	const [isWebSearchMode, setIsWebSearchMode] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	// Modified web search handler
	const handleWebSearch = useCallback(async () => {
		setIsWebSearchMode(!isWebSearchMode);
		
		if (isWebSearchMode) {
			setInput("");
			setLocalInput("");
		} else {
			const currentInput = input.trim();
			if (!currentInput.toLowerCase().startsWith("search:")) {
				setInput(`Search: ${currentInput}`);
			}
		}
	}, [isWebSearchMode, input, setInput, setLocalInput]);

	// Update submit handler to handle all combinations
	const onSubmit = useCallback(async () => {
		const searchText = input.trim();
		const hasAttachments = attachments.length > 0;

		// Validate input
		if (!searchText && !hasAttachments) {
			toast.error("Please enter a message or add an attachment");
			return;
		}

		try {
			setIsSearching(true);

			if (isWebSearchMode) {
				// Execute web search
				const searchQuery = searchText.replace(/^search:\s*/i, '');
				const response = await fetch(
					`/api/search?query=${encodeURIComponent(searchQuery)}`
				);
				
				if (!response.ok) {
					throw new Error("Search failed");
				}

				const data = await response.json();
				
				// Format and append results
				const formattedResults = data.results
					.map((result: any, index: number) => (
						`${index + 1}. ${result.Text}\n${result.FirstURL ? `   Link: ${result.FirstURL}\n` : ''}`
					))
					.join('\n');

				// First, append user's query with attachments if any
				await append(
					{
						role: "user",
						content: searchText,
					},
					hasAttachments ? { experimental_attachments: attachments } : undefined
				);

				// Then append search results
				await append(
					{
						role: "assistant",
						content: `🔍 Search Results for "${searchQuery}":\n\n${formattedResults}\n\n${hasAttachments ? "📎 Search includes attached files\n\n" : ""}---\nResults powered by DuckDuckGo`,
					}
				);
			} else {
				// Normal message with optional attachments
				await append(
					{
						role: "user",
						content: searchText,
					},
					hasAttachments ? { experimental_attachments: attachments } : undefined
				);
			}

			// Clear input and reset modes
			setInput("");
			setAttachments([]);
			setLocalInput("");
			setIsWebSearchMode(false);
		} catch (error) {
			console.error("Error:", error);
			toast.error(isWebSearchMode ? "Failed to perform web search" : "Failed to send message");
		} finally {
			setIsSearching(false);
		}
	}, [
		input,
		attachments,
		append,
		isWebSearchMode,
		setInput,
		setAttachments,
		setLocalInput,
	]);

	return (
		<motion.div 
			className="relative w-full flex flex-col gap-4"
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.3 }}
		>
			{/* Loading Skeleton - Moved to top */}
			{isLoading && (
				<motion.div 
					className="sticky top-0 z-50 w-full py-2 px-4"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
				>
					<div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
						<LoadingSkeleton className="w-full max-w-[300px] mx-auto" />
					</div>
				</motion.div>
			)}

			{/* Suggested Actions - No opacity change during loading */}
			{messages.length === 0 && (
				<div className="grid sm:grid-cols-2 gap-2">
					{SUGGESTED_ACTIONS.map((action) => (
						<Button
							key={action.title}
							variant="ghost"
							onClick={() => setInput(action.action)}
							className="text-left h-auto py-3"
							disabled={isLoading}
						>
							<span className="flex flex-col">
								<span className="font-medium">{action.title}</span>
								<span className="text-xs text-muted-foreground">
									{action.label}
								</span>
							</span>
						</Button>
					))}
				</div>
			)}

			{/* Input Area - Remains fully visible during loading */}
			<div className="relative flex items-end gap-2">
				<Textarea
					ref={textareaRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Send a message..."
					disabled={isLoading}
					className={cx(
						"min-h-[24px] max-h-[75vh] pr-24 resize-none rounded-xl",
						className
					)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							isLoading ? toast.error("Please wait...") : onSubmit();
						}
					}}
				/>

				{/* Action Buttons - Maintain visibility during loading */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					{webSearchEnabled && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant={isWebSearchMode ? "default" : "outline"}
									onClick={handleWebSearch}
									disabled={isLoading || isSearching}
									className={cx(
										"size-8 rounded-full transition-all duration-200",
										{
											"bg-primary text-primary-foreground": isWebSearchMode,
											"hover:bg-primary/90 hover:text-primary-foreground": !isWebSearchMode,
										}
									)}
								>
									<GlobeIcon 
										size={16} 
										className={cx(
											"transition-all",
											{
												"text-primary-foreground": isWebSearchMode,
											}
										)} 
									/>
									<span className="sr-only">
										{isWebSearchMode ? 
											attachments.length > 0 ? 
												"Web search mode with attachments" : 
												"Web search mode active" 
											: "Enable web search"}
									</span>
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{isWebSearchMode ? 
									attachments.length > 0 ? 
										"Web search mode with attachments" : 
										"Web search mode active" 
									: "Enable web search"}
							</TooltipContent>
						</Tooltip>
					)}

					<Button
						size="icon"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="size-8 rounded-full"
					>
						<Paperclip size={16} />
					</Button>

					<Button
						size="icon"
						variant={input ? "default" : "outline"}
						onClick={() => (isLoading ? stop() : onSubmit())}
						disabled={!input && !attachments.length}
						className="size-8 rounded-full"
					>
						{isLoading ? (
							<Square size={16} className="animate-pulse" />
						) : input ? (
							<ArrowUp size={16} />
						) : (
							<Square size={16} />
						)}
					</Button>
				</div>
			</div>
		</motion.div>
	);
}
