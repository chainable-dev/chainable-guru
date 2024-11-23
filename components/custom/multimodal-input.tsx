"use client";

import cx from "classnames";
import React, { useRef, useCallback } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from 'wagmi';
import { 
	IoArrowUpOutline,
	IoAttachOutline,
	IoStopOutline,
	IoGlobeOutline,
	IoWalletOutline,
	IoSquareOutline,
} from "react-icons/io5";

import { useWalletState } from "@/hooks/useWalletState";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
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

	// Web search handler with better formatting
	const handleWebSearch = useCallback(async () => {
		const searchText = input.trim();
		if (!searchText) {
			toast.error("Please enter a search query");
			return;
		}

		try {
			const response = await fetch(
				`/api/search?query=${encodeURIComponent(searchText)}`
			);
			
			if (!response.ok) {
				throw new Error("Search failed");
			}

			const data = await response.json();
			
			// Improved formatting for search results
			const formattedResults = data.results
				.map((result: any, index: number) => (
					`${index + 1}. ${result.Text}\n${result.FirstURL ? `   Link: ${result.FirstURL}\n` : ''}`
				))
				.join('\n');

			const searchMessage = `🔍 **Web Search Results**\n\nQuery: "${searchText}"\n\n${formattedResults}\n\n---\nResults powered by DuckDuckGo`;

			// Append search results to chat
			await append(
				{
					role: "assistant",
					content: searchMessage,
				}
			);

			// Also append the user's query
			await append(
				{
					role: "user",
					content: `Search: ${searchText}`,
				}
			);

			setInput("");
			setLocalInput("");
		} catch (error) {
			console.error("Search error:", error);
			toast.error("Failed to perform web search");
		}
	}, [input, append, setInput, setLocalInput]);

	// Add balance check handler
	const handleBalanceCheck = useCallback(async () => {
		if (!address) {
			toast.error("Please connect your wallet first");
			return;
		}

		try {
			// Fetch both basic balance and DeBankAPI data
			const [ethResponse, debankResponse] = await Promise.all([
				fetch(`/api/wallet/balance?address=${address}&network=base-sepolia`),
				fetch(`/api/wallet/debank?address=${address}`),
			]);
			
			if (!ethResponse.ok || !debankResponse.ok) {
				throw new Error("Balance check failed");
			}

			const [ethData, debankData] = await Promise.all([
				ethResponse.json(),
				debankResponse.json(),
			]);
			
			// Format the balance message with both ETH and token balances
			const tokenList = debankData.tokens
				.filter((token: any) => token.usd_value > 1) // Only show tokens worth more than $1
				.map((token: any) => 
					`- ${token.symbol}: ${Number(token.balance).toFixed(4)} (${token.chain}) ≈ $${token.usd_value.toFixed(2)}`
				)
				.join('\n');

			const balanceMessage = `💰 **Wallet Balance**\n\n` +
				`Address: \`${address}\`\n` +
				`Network: Base Sepolia\n` +
				`ETH Balance: ${Number(ethData.balance).toFixed(4)} ETH\n\n` +
				`**Total Portfolio Value:** $${debankData.totalBalance.total_usd_value.toFixed(2)}\n\n` +
				`**Token Balances:**\n${tokenList}\n\n` +
				`---\nLast updated: ${new Date().toLocaleString()}`;

			// Append balance info to chat
			await append(
				{
					role: "assistant",
					content: balanceMessage,
				}
			);

		} catch (error) {
			console.error("Balance check error:", error);
			toast.error("Failed to check wallet balance");
		}
	}, [address, append]);

	// Update submit handler to include balance check
	const onSubmit = useCallback(async () => {
		const searchText = input.trim();
		if (!searchText && attachments.length === 0) {
			toast.error("Please enter a message or add an attachment");
			return;
		}

		const isWalletQuery = searchText.toLowerCase().includes("wallet") || 
							 searchText.toLowerCase().includes("balance");
		const isWebSearch = searchText.toLowerCase().includes("search");

		if (isWalletQuery && (!isConnected || !isCorrectNetwork)) {
			toast.error("Please connect your wallet and ensure correct network");
			return;
		}

		try {
			if (isWalletQuery) {
				await handleBalanceCheck();
				return;
			}

			if (isWebSearch && webSearchEnabled) {
				await handleWebSearch();
				return;
			}

			await append(
				{
						role: "user",
						content: searchText,
				},
				{ experimental_attachments: attachments }
			);

			setInput("");
			setAttachments([]);
			setLocalInput("");
		} catch (error) {
			toast.error("Failed to send message");
		}
	}, [
		input,
		attachments,
		append,
		isConnected,
		isCorrectNetwork,
		handleWebSearch,
		handleBalanceCheck,
		webSearchEnabled,
		setInput,
		setAttachments,
		setLocalInput,
	]);

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
								<span className="text-xs text-muted-foreground">
									{action.label}
								</span>
							</span>
						</Button>
					))}
				</div>
			)}

			{/* Input Area */}
			<div className="relative flex items-end gap-2">
				<Textarea
					ref={textareaRef}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Send a message..."
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

				{/* Action Buttons */}
				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					{webSearchEnabled && (
						<Button
							size="icon"
							variant="outline"
							onClick={handleWebSearch}
							disabled={isLoading || !input.trim()}
							className="size-8 rounded-full"
						>
							<IoGlobeOutline size={16} />
						</Button>
					)}

					<Button
						size="icon"
						variant="outline"
						onClick={handleBalanceCheck}
						disabled={isLoading || !isConnected}
						className="size-8 rounded-full"
					>
						<IoWalletOutline size={16} />
					</Button>

					<Button
						size="icon"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="size-8 rounded-full"
					>
						<IoAttachOutline size={16} />
					</Button>

					<Button
						size="icon"
							variant={input ? "default" : "outline"}
							onClick={() => (isLoading ? stop() : onSubmit())}
							disabled={!input && !attachments.length}
							className="size-8 rounded-full"
					>
						{isLoading ? <IoSquareOutline size={16} /> : <IoArrowUpOutline size={16} />}
					</Button>
				</div>
			</div>
		</div>
	);
}
