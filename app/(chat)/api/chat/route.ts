import {
	CoreMessage,
	Message,
	StreamData,
	convertToCoreMessages,
	streamObject,
	streamText,
} from "ai";
import { ethers } from "ethers";
import { z } from "zod";

import { customModel } from "@/ai";
import { models } from "@/ai/models";
import { blocksPrompt, regularPrompt, systemPrompt } from "@/ai/prompts";
import { getChatById, getDocumentById, getSession } from "@/db/cached-queries";
import {
	saveChat,
	saveDocument,
	saveMessages,
	saveSuggestions,
	deleteChatById,
} from "@/db/mutations";
import { createClient } from "@/lib/supabase/server";
import { MessageRole } from "@/lib/supabase/types";
import {
	generateUUID,
	getMostRecentUserMessage,
	sanitizeResponseMessages,
} from "@/lib/utils";
import { searchDuckDuckGo, searchOpenSearch } from "@/lib/search/search-utils";
import { FEATURES } from "@/lib/features";
import { useWalletState } from "@/hooks/useWalletState";
import { getServerWalletState } from "@/hooks/useServerWalletState";
import { kv } from "@vercel/kv";

import { useAccount, useBalance, useChainId } from "wagmi";

import { generateTitleFromUserMessage } from "../../actions";
export const maxDuration = 60;

interface WeatherParams {
	latitude: number;
	longitude: number;
}

interface CreateDocumentParams {
	title: string;
	modelId: string;
}

interface UpdateDocumentParams {
	id: string;
	description: string;
	modelId: string;
}

interface RequestSuggestionsParams {
	documentId: string;
	modelId: string;
}

interface WalletStateParams {
	address?: string;
	chainId?: number;
}

type AllowedTools =
	| "createDocument"
	| "updateDocument"
	| "requestSuggestions"
	| "getWeather"
	| "getWalletBalance"
	| "checkWalletState"
	| "webSearch";

const blocksTools: AllowedTools[] = [
	"createDocument",
	"updateDocument",
	"requestSuggestions",
];

const weatherTools: AllowedTools[] = ["getWeather"];

const allTools: AllowedTools[] = [
	...blocksTools,
	...weatherTools,
	"getWalletBalance" as AllowedTools,
	"checkWalletState" as AllowedTools,
	"webSearch" as AllowedTools,
];

async function getUser() {
	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new Error("Unauthorized");
	}

	return user;
}

// Add helper function to format message content for database storage
function formatMessageContent(message: CoreMessage): string {
	// For user messages, store as plain text
	if (message.role === "user") {
		return typeof message.content === "string"
			? message.content
			: JSON.stringify(message.content);
	}

	// For tool messages, format as array of tool results
	if (message.role === "tool") {
		return JSON.stringify(
			message.content.map((content) => ({
				type: content.type || "tool-result",
				toolCallId: content.toolCallId,
				toolName: content.toolName,
				result: content.result,
			})),
		);
	}

	// For assistant messages, format as array of text and tool calls
	if (message.role === "assistant") {
		if (typeof message.content === "string") {
			return JSON.stringify([{ type: "text", text: message.content }]);
		}

		return JSON.stringify(
			message.content.map((content) => {
				if (content.type === "text") {
					return {
						type: "text",
						text: content.text,
					};
				}
				return {
					type: "tool-call",
					toolCallId: content.toolCallId,
					toolName: content.toolName,
					args: content.args,
				};
			}),
		);
	}

	return "";
}

// Add type for wallet balance parameters
interface WalletBalanceParams {
	address: string;
	network?: string;
}

// Add interface for wallet message content
interface WalletMessageContent {
	text: string;
	walletAddress?: string;
	chainId?: number;
	network?: string;
	isWalletConnected?: boolean;
	attachments?: Array<{
		url: string;
		name: string;
		type: string;
	}>;
}

// Add interface for wallet state
interface WalletState {
	address: string | null;
	isConnected: boolean;
	chainId?: number;
	networkInfo?: {
		name: string;
		id: number;
	};
	isCorrectNetwork: boolean;
	balances?: {
		eth?: string;
		usdc?: string;
	};
	lastUpdated?: string;
}

const WALLET_KEY_PREFIX = "wallet-state:";

// Update the tools object to properly handle tool results
const tools = {
	getWeather: {
		description: "Get the current weather at a location",
		parameters: z.object({
			latitude: z.number(),
			longitude: z.number(),
		}),
		execute: async ({ latitude, longitude }: WeatherParams) => {
			const response = await fetch(
				`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
			);

			const weatherData = await response.json();
			return weatherData;
		},
	},
	createDocument: {
		description: "Create a document for a writing activity",
		parameters: z.object({
			title: z.string(),
		}),
		execute: async (params: CreateDocumentParams) => {
			const id = generateUUID();
			let draftText: string = "";
			const data = new StreamData();

			data.append({ type: "id", content: id });
			data.append({ type: "title", content: params.title });
			data.append({ type: "clear", content: "" });

			const { fullStream } = await streamText({
				model: customModel(params.modelId),
				system:
					"Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
				prompt: params.title,
			});

			for await (const delta of fullStream) {
				const { type } = delta;

				if (type === "text-delta") {
					draftText += delta.textDelta;
					// Stream content updates in real-time
					data.append({
						type: "text-delta",
						content: delta.textDelta,
					});
				}
			}

			data.append({ type: "finish", content: "" });

			const currentUser = await getUser();
			if (currentUser?.id) {
				await saveDocument({
					id,
					title: params.title,
					content: draftText,
					userId: currentUser.id,
				});
			}

			return {
				id,
				title: params.title,
				content: `A document was created and is now visible to the user.`,
			};
		},
	},
	updateDocument: {
		description: "Update a document with the given description",
		parameters: z.object({
			id: z.string(),
			description: z.string(),
		}),
		execute: async (params: UpdateDocumentParams) => {
			const document = await getDocumentById(params.id);
			const data = new StreamData();

			if (!document) {
				return { error: "Document not found" };
			}

			const { content: currentContent } = document;
			let draftText: string = "";

			data.append({
				type: "clear",
				content: document.title,
			});

			const { fullStream } = await streamText({
				model: customModel(params.modelId),
				system:
					"You are a helpful writing assistant. Based on the description, please update the piece of writing.",
				experimental_providerMetadata: {
					openai: {
						prediction: {
							type: "content",
							content: currentContent || "",
						},
					},
				},
				messages: [
					{ role: "user", content: params.description },
					{ role: "user", content: currentContent || "" },
				],
			});

			for await (const delta of fullStream) {
				const { type } = delta;

				if (type === "text-delta") {
					const { textDelta } = delta;
					draftText += textDelta;
					data.append({
						type: "text-delta",
						content: textDelta,
					});
				}
			}

			data.append({ type: "finish", content: "" });

			const currentUser = await getUser();
			if (currentUser?.id) {
				await saveDocument({
					id: params.id,
					title: document.title,
					content: draftText,
					userId: currentUser.id,
				});
			}

			return {
				id: params.id,
				title: document.title,
				content: "The document has been updated successfully.",
			};
		},
	},
	requestSuggestions: {
		description: "Request suggestions for a document",
		parameters: z.object({
			documentId: z.string(),
		}),
		execute: async (params: RequestSuggestionsParams) => {
			const document = await getDocumentById(params.documentId);
			const data = new StreamData();
			const suggestions: Array<{
				originalText: string;
				suggestedText: string;
				description: string;
				id: string;
				documentId: string;
				isResolved: boolean;
			}> = [];

			if (!document || !document.content) {
				return { error: "Document not found" };
			}

			const { elementStream } = await streamObject({
				model: customModel(params.modelId),
				system:
					"You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
				prompt: document.content,
				output: "array",
				schema: z.object({
					originalSentence: z.string().describe("The original sentence"),
					suggestedSentence: z.string().describe("The suggested sentence"),
					description: z.string().describe("The description of the suggestion"),
				}),
			});

			for await (const element of elementStream) {
				const suggestion = {
					originalText: element.originalSentence,
					suggestedText: element.suggestedSentence,
					description: element.description,
					id: generateUUID(),
					documentId: params.documentId,
					isResolved: false,
				};

				data.append({
					type: "suggestion",
					content: suggestion,
				});
				suggestions.push(suggestion);
			}

			const currentUser = await getUser();
			if (currentUser?.id) {
				await saveSuggestions({
					suggestions: suggestions.map((suggestion) => ({
						...suggestion,
						userId: currentUser.id,
						createdAt: new Date(),
						documentCreatedAt: document.created_at,
					})),
				});
			}

			return {
				id: params.documentId,
				title: document.title,
				message: "Suggestions have been added to the document",
			};
		},
	},
	getWalletBalance: {
		description: "Get the balance of the connected wallet",
		parameters: z.object({
			address: z.string().describe("The wallet address to check"),
			chainId: z.number().describe("The chain ID of the connected wallet"),
		}),
		execute: async ({
			address,
			chainId,
		}: {
			address: string;
			chainId: number;
		}) => {
			try {
				const walletState = await kv.get<WalletState>(
					`${WALLET_KEY_PREFIX}${address}`,
				);

				if (!walletState) {
					return {
						type: "tool-result",
						result: {
							error: "No wallet state found",
							details: "Please connect your wallet first",
						},
					};
				}

				// Validate supported network
				if (![8453, 84532].includes(chainId)) {
					return {
						type: "tool-result",
						result: {
							error: `Unsupported chain ID: ${chainId}`,
							details: "Please connect to Base Mainnet or Base Sepolia.",
						},
					};
				}

				const networkName = chainId === 8453 ? "Base Mainnet" : "Base Sepolia";
				const usdcAddress =
					chainId === 8453
						? "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // Base Mainnet USDC
						: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC

				// Create provider based on network
				const provider = new ethers.JsonRpcProvider(
					chainId === 8453
						? "https://mainnet.base.org"
						: "https://sepolia.base.org",
				);

				// Get ETH balance
				const ethBalance = await provider.getBalance(address);

				// Create USDC contract instance
				const usdcContract = new ethers.Contract(
					usdcAddress,
					["function balanceOf(address) view returns (uint256)"],
					provider,
				);

				// Get USDC balance
				const usdcBalance = await usdcContract.balanceOf(address);

				// Update wallet state with new balances
				const updatedState = {
					...walletState,
					balances: {
						eth: ethers.formatEther(ethBalance),
						usdc: ethers.formatUnits(usdcBalance, 6),
					},
					lastUpdated: new Date().toISOString(),
				};

				// Save updated state
				await kv.set(
					`${WALLET_KEY_PREFIX}${address}`,
					JSON.stringify(updatedState),
				);

				return {
					type: "tool-result",
					result: {
						address,
						network: networkName,
						chainId,
						balances: updatedState.balances,
						timestamp: updatedState.lastUpdated,
					},
				};
			} catch (error) {
				console.error("Error fetching wallet balance:", error);
				return {
					type: "tool-result",
					result: {
						error: "Failed to fetch wallet balance",
						details: error instanceof Error ? error.message : "Unknown error",
					},
				};
			}
		},
	},
	checkWalletState: {
		description: "Check the current state of the connected wallet",
		parameters: z.object({
			address: z.string().optional().describe("The wallet address to check"),
			chainId: z.number().optional().describe("The chain ID to check"),
		}),
		execute: async ({ address }: WalletStateParams) => {
			try {
				const walletState = address
					? await kv.get<WalletState>(`${WALLET_KEY_PREFIX}${address}`)
					: null;

				return {
					type: "tool-result",
					result: {
						isConnected: !!walletState?.address,
						address: walletState?.address || null,
						chainId: walletState?.chainId || null,
						network: walletState?.networkInfo?.name || "Unknown Network",
						isSupported: walletState?.isCorrectNetwork || false,
						supportedNetworks: [
							{ name: "Base Mainnet", chainId: 8453 },
							{ name: "Base Sepolia", chainId: 84532 },
						],
						timestamp: new Date().toISOString(),
					},
				};
			} catch (error) {
				console.error("Error checking wallet state:", error);
				return {
					type: "tool-result",
					result: {
						error: "Failed to check wallet state",
						details: error instanceof Error ? error.message : "Unknown error",
					},
				};
			}
		},
	},
	webSearch: {
		description: "Search the web using DuckDuckGo",
		parameters: z.object({
			query: z.string().describe("The search query"),
			searchType: z
				.enum(["duckduckgo", "opensearch"])
				.describe("The search engine to use"),
		}),
		execute: async ({
			query,
			searchType,
		}: {
			query: string;
			searchType: "duckduckgo" | "opensearch";
		}) => {
			try {
				let results;
				if (searchType === "duckduckgo") {
					results = await searchDuckDuckGo(query);
				} else {
					results = await searchOpenSearch(query);
				}

				return {
					type: "tool-result",
					result: {
						searchEngine: searchType,
						query,
						results,
						timestamp: new Date().toISOString(),
					},
				};
			} catch (error) {
				return {
					type: "tool-result",
					result: {
						error: "Search failed",
						details: error instanceof Error ? error.message : "Unknown error",
					},
				};
			}
		},
	},
};

export async function POST(request: Request) {
	try {
		const {
			id,
			messages,
			modelId,
		}: { id: string; messages: Array<Message>; modelId: string } =
			await request.json();

		const user = await getUser();

		if (!user) {
			return new Response("Unauthorized", { status: 401 });
		}

		const model = models.find((model) => model.id === modelId);

		if (!model) {
			return new Response("Model not found", { status: 404 });
		}

		const coreMessages = convertToCoreMessages(messages);
		const userMessage = getMostRecentUserMessage(coreMessages);

		if (!userMessage) {
			return new Response("No user message found", { status: 400 });
		}

		// Parse the message content and create context
		let walletInfo: WalletMessageContent = { text: "" };
		try {
			if (typeof userMessage.content === "string") {
				try {
					walletInfo = JSON.parse(userMessage.content);
				} catch {
					walletInfo = { text: userMessage.content };
				}
			}
		} catch (e) {
			console.error("Error processing message content:", e);
			walletInfo = {
				text:
					typeof userMessage.content === "string" ? userMessage.content : "",
			};
		}

		// Create messages with enhanced wallet context
		const messagesWithContext = coreMessages.map((msg) => {
			if (msg.role === "user" && msg === userMessage) {
				const baseMessage = {
					...msg,
					content:
						walletInfo.text ||
						(typeof msg.content === "string"
							? msg.content
							: JSON.stringify(msg.content)),
				};

				if (walletInfo.walletAddress && walletInfo.chainId !== undefined) {
					return {
						...baseMessage,
						walletAddress: walletInfo.walletAddress,
						chainId: walletInfo.chainId,
						isWalletConnected: true,
						lastChecked: new Date().toISOString(),
					};
				}

				return {
					...baseMessage,
					isWalletConnected: false,
					lastChecked: new Date().toISOString(),
				};
			}
			return msg;
		});

		// Initialize streaming data
		const streamingData = new StreamData();

		try {
			// Try to get existing chat
			const chat = await getChatById(id);

			// If chat doesn't exist, create it
			if (!chat) {
				const title = await generateTitleFromUserMessage({
					message: userMessage as unknown as { role: "user"; content: string },
				});
				try {
					await saveChat({ id, userId: user.id, title });
				} catch (error) {
					// Ignore duplicate chat error, continue with message saving
					if (
						!(
							error instanceof Error &&
							error.message === "Chat ID already exists"
						)
					) {
						throw error;
					}
				}
			} else if (chat.user_id !== user.id) {
				return new Response("Unauthorized", { status: 401 });
			}

			// Save the user message
			await saveMessages({
				chatId: id,
				messages: [
					{
						id: generateUUID(),
						chat_id: id,
						role: userMessage.role as MessageRole,
						content: formatMessageContent(userMessage),
						created_at: new Date().toISOString(),
					},
				],
			});

			// Process the message with AI
			const result = await streamText({
				model: customModel(model.apiIdentifier),
				system: systemPrompt,
				messages: messagesWithContext,
				maxSteps: 5,
				experimental_activeTools: allTools,
				tools: {
					...tools,
					createDocument: {
						...tools.createDocument,
						execute: (params) =>
							tools.createDocument.execute({
								...params,
								modelId: model.apiIdentifier,
							}),
					},
					updateDocument: {
						...tools.updateDocument,
						execute: (params) =>
							tools.updateDocument.execute({
								...params,
								modelId: model.apiIdentifier,
							}),
					},
					requestSuggestions: {
						...tools.requestSuggestions,
						execute: (params) =>
							tools.requestSuggestions.execute({
								...params,
								modelId: model.apiIdentifier,
							}),
					},
				},
				onFinish: async (event) => {
				  const { responseMessages } = event;
					if (user && user.id) {
						try {
							const responseMessagesWithoutIncompleteToolCalls =
								sanitizeResponseMessages(responseMessages as (CoreAssistantMessage | CoreToolMessage)[]);

							await saveMessages({
								chatId: id,
								messages: responseMessagesWithoutIncompleteToolCalls.map(
									(message) => {
										const messageId = generateUUID();
										if (message.role === "assistant") {
											streamingData.appendMessageAnnotation({
												messageIdFromServer: messageId,
											});
										}
										return {
											id: messageId,
											chat_id: id,
											role: message.role as MessageRole,
											content: formatMessageContent(message),
											created_at: new Date().toISOString(),
										};
									},
								),
							});
						} catch (error) {
							console.error("Failed to save chat:", error);
						}
					}
					streamingData.close();
				},
				experimental_telemetry: {
					isEnabled: true,
					functionId: "stream-text",
				},
			});

			return result.toDataStreamResponse({
				data: streamingData,
			});
		} catch (error) {
			console.error("Error in chat route:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
			});
		}
	} catch (error) {
		console.error("Error parsing request:", error);
		return new Response(JSON.stringify({ error: "Invalid request" }), {
			status: 400,
		});
	}
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return new Response("Not Found", { status: 404 });
	}

	const user = await getUser();

	try {
		const chat = await getChatById(id);

		if (!chat) {
			return new Response("Chat not found", { status: 404 });
		}

		if (chat.user_id !== user.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		await deleteChatById(id, user.id);

		return new Response("Chat deleted", { status: 200 });
	} catch (error) {
		console.error("Error deleting chat:", error);
		return new Response("An error occurred while processing your request", {
			status: 500,
		});
	}
}
