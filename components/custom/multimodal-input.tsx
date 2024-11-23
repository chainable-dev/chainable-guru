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
	WalletIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { messageAnimationVariants } from "@/lib/animation-variants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

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

// Add hover animation variants
const cardVariants = {
	initial: { 
		scale: 1,
		backgroundColor: "var(--background)" 
	},
	hover: { 
		scale: 1.02,
		backgroundColor: "var(--accent)",
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 17
		}
	},
	tap: { 
		scale: 0.98,
		backgroundColor: "var(--accent)",
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 17
		}
	}
};

// Add info tooltips for actions
const ACTION_INFO = {
	webSearch: {
		title: "Web Search",
		description: "Search the web for information. You can include attachments with your search.",
		shortcuts: ["Click globe icon", "Type 'search:'"],
		examples: ["search: latest blockchain news", "search: weather in London"],
	},
	attachments: {
		title: "Attachments",
		description: "Upload files to include with your message. Supports images, PDFs, and documents.",
		formats: ["Images (PNG, JPG)", "Documents (PDF, DOC)", "Text files"],
		maxSize: "10MB",
	},
	send: {
		title: "Send Message",
		description: "Send your message or execute search",
		shortcuts: ["Enter", "Click arrow"],
		modes: ["Normal message", "Web search", "With attachments"],
	},
} as const;

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

			{/* Enhanced Suggested Actions */}
			{messages.length === 0 && (
				<div className="grid sm:grid-cols-2 gap-2">
					{SUGGESTED_ACTIONS.map((action) => (
						<motion.div
							key={action.title}
							variants={cardVariants}
							initial="initial"
							whileHover="hover"
							whileTap="tap"
							className="overflow-hidden"
						>
							<Button
								variant="ghost"
								onClick={() => {
									setInput(action.action);
									// Add focus to textarea
									textareaRef.current?.focus();
								}}
								className="w-full text-left h-auto py-3 relative group"
								disabled={isLoading}
							>
								<motion.span 
									className="flex flex-col relative z-10"
									initial={{ x: 0 }}
									whileHover={{ x: 4 }}
									transition={{ type: "spring", stiffness: 300, damping: 25 }}
								>
									<span className="font-medium flex items-center gap-2">
										{action.title}
										<motion.span
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.1 }}
											className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100"
										>
											Try it →
										</motion.span>
									</span>
									<span className="text-xs text-muted-foreground">
										{action.label}
									</span>
								</motion.span>
							</Button>
						</motion.div>
					))}
				</div>
			)}

			{/* Input Area with Enhanced Info */}
			<div className="relative flex items-end gap-2">
				<HoverCard openDelay={300} closeDelay={100}>
					<HoverCardTrigger asChild>
						<Textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder={isWebSearchMode ? "Enter your search query..." : "Send a message..."}
							disabled={isLoading}
							className={cx(
								"min-h-[24px] max-h-[75vh] pr-24 resize-none rounded-xl",
								className,
								isWebSearchMode && "border-primary/50"
							)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									isLoading ? toast.error("Please wait...") : onSubmit();
								}
							}}
						/>
					</HoverCardTrigger>
					<HoverCardContent className="w-80">
						<div className="space-y-2">
							<h4 className="font-medium">Input Mode: {isWebSearchMode ? "Web Search" : "Chat"}</h4>
							<p className="text-sm text-muted-foreground">
								{isWebSearchMode ? ACTION_INFO.webSearch.description : "Type your message and press Enter to send."}
							</p>
							{attachments.length > 0 && (
								<p className="text-xs text-muted-foreground">
									📎 {attachments.length} attachment{attachments.length > 1 ? "s" : ""} included
								</p>
							)}
						</div>
					</HoverCardContent>
				</HoverCard>

				{/* Action Buttons with Enhanced Info */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					{webSearchEnabled && (
						<HoverCard openDelay={300} closeDelay={100}>
							<HoverCardTrigger asChild>
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
									<GlobeIcon size={16} />
								</Button>
							</HoverCardTrigger>
							<HoverCardContent className="w-80">
								<div className="space-y-2">
									<h4 className="font-medium">{ACTION_INFO.webSearch.title}</h4>
									<p className="text-sm">{ACTION_INFO.webSearch.description}</p>
									<div className="mt-2 space-y-1">
										<p className="text-xs font-medium">Shortcuts:</p>
										<ul className="text-xs text-muted-foreground">
											{ACTION_INFO.webSearch.shortcuts.map((shortcut) => (
												<li key={shortcut}>• {shortcut}</li>
											))}
										</ul>
									</div>
								</div>
							</HoverCardContent>
						</HoverCard>
					)}

					<HoverCard openDelay={300} closeDelay={100}>
						<HoverCardTrigger asChild>
							<Button
								size="icon"
								variant="outline"
								onClick={() => fileInputRef.current?.click()}
								disabled={isLoading}
								className="size-8 rounded-full"
							>
								<Paperclip size={16} />
							</Button>
						</HoverCardTrigger>
						<HoverCardContent className="w-80">
							<div className="space-y-2">
								<h4 className="font-medium">{ACTION_INFO.attachments.title}</h4>
								<p className="text-sm">{ACTION_INFO.attachments.description}</p>
								<div className="mt-2 space-y-1">
									<p className="text-xs font-medium">Supported formats:</p>
									<ul className="text-xs text-muted-foreground">
										{ACTION_INFO.attachments.formats.map((format) => (
											<li key={format}>• {format}</li>
										))}
									</ul>
									<p className="text-xs text-muted-foreground">
										Maximum file size: {ACTION_INFO.attachments.maxSize}
									</p>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>

					<HoverCard openDelay={300} closeDelay={100}>
						<HoverCardTrigger asChild>
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
						</HoverCardTrigger>
						<HoverCardContent className="w-80">
							<div className="space-y-2">
								<h4 className="font-medium">{ACTION_INFO.send.title}</h4>
								<p className="text-sm">{ACTION_INFO.send.description}</p>
								<div className="mt-2 space-y-1">
									<p className="text-xs font-medium">Shortcuts:</p>
									<ul className="text-xs text-muted-foreground">
										{ACTION_INFO.send.shortcuts.map((shortcut) => (
											<li key={shortcut}>• {shortcut}</li>
										))}
									</ul>
									<p className="text-xs text-muted-foreground">
										Current mode: {isWebSearchMode ? "Web Search" : "Normal"}{attachments.length > 0 ? " with attachments" : ""}
									</p>
								</div>
							</div>
						</HoverCardContent>
					</HoverCard>
				</div>
			</div>
		</motion.div>
	);
}
