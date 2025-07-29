import {
	CoreMessage,
	Message,
	StreamData,
	convertToCoreMessages,
	streamObject,
	streamText,
} from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { models } from "@/ai/models";

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
import { kv } from "@vercel/kv";

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

// Removed wallet state params interface

type AllowedTools =
	| "createDocument"
	| "updateDocument"
	| "requestSuggestions"
	| "getWeather"
	| "webSearch"
	| "getCryptoPrice";

const blocksTools: AllowedTools[] = [
	"createDocument",
	"updateDocument",
	"requestSuggestions",
];

const weatherTools: AllowedTools[] = ["getWeather"];

const allTools: AllowedTools[] = [
	...blocksTools,
	...weatherTools,
	"webSearch" as AllowedTools,
	"getCryptoPrice" as AllowedTools,
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
// Removed wallet-related interfaces

// Removed wallet key prefix

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
	// Removed wallet-related tools
	  ...(true
		? {
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
									details:
										error instanceof Error ? error.message : "Unknown error",
								},
							};
						}
					},
				},
			}
		: {}),
	getCryptoPrice: {
		description: 'Get current cryptocurrency price and market data',
		parameters: z.object({
			symbol: z.string().describe('The cryptocurrency symbol (e.g., bitcoin, ethereum)')
		}),
		execute: async ({ symbol }: { symbol: string }) => {
			try {
				const response = await fetch(
					`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
				);
				
				if (!response.ok) {
					throw new Error('Failed to fetch crypto data');
				}

				const rawData = await response.json();
				
				// Create the data object with proper structure
				const cryptoData = {
					symbol,
					price: rawData[symbol].usd,
					timestamp: new Date().toISOString(),
					change_24h: rawData[symbol].usd_24h_change,
					market_cap: rawData[symbol].usd_market_cap,
					volume_24h: rawData[symbol].usd_24h_vol,
					last_updated: new Date(rawData[symbol].last_updated_at * 1000).toISOString()
				};

				// Validate the data with Zod
				const validatedData = CryptoPriceSchema.parse(cryptoData);

				// Return as a tool result with type information
				return {
					type: "tool-result",
					result: {
						type: "crypto-price",
						data: validatedData
					}
				};
			} catch (error) {
				console.error('Error fetching crypto price:', error);
				return {
					type: "tool-result",
					result: {
						error: "Failed to fetch crypto price",
						details: error instanceof Error ? error.message : "Unknown error"
					}
				};
			}
		}
	},
};

// Define Zod schema for crypto price data
const CryptoPriceSchema = z.object({
	symbol: z.string(),
	price: z.number(),
	timestamp: z.string(),
	change_24h: z.number().optional(),
	market_cap: z.number().optional(),
	volume_24h: z.number().optional(),
	last_updated: z.string().optional(),
	historical_data: z.array(z.object({
		timestamp: z.string(),
		price: z.number()
	})).optional()
});

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

		// Use the original messages without wallet context
		const messagesWithContext = coreMessages;

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
				    system: "You are a helpful AI assistant.",
				messages: messagesWithContext,
				maxSteps: 5,
				experimental_activeTools: ['getWeather', 'getCryptoPrice'],
				tools,
				onFinish: async ({ responseMessages }) => {
					if (user && user.id) {
						try {
							const responseMessagesWithoutIncompleteToolCalls =
								sanitizeResponseMessages(responseMessages);

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
