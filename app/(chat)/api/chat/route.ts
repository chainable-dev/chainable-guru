import { ethers } from 'ethers';
import { z } from 'zod';
import {
  CoreMessage,
  Message,
  StreamData,
  convertToCoreMessages,
  streamObject,
  streamText,
} from 'ai';

import { customModel } from '@/ai';
import { models } from '@/ai/models';
import { blocksPrompt, regularPrompt, systemPrompt } from '@/ai/prompts';
import { getChatById, getDocumentById, getSession } from '@/db/cached-queries';
import {
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
  deleteChatById,
} from '@/db/mutations';
import { createClient } from '@/lib/supabase/server';
import { MessageRole } from '@/lib/supabase/types';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather'
  | 'getWalletBalance';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools, 'getWalletBalance'];

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

// Add helper function to format message content for database storage
function formatMessageContent(message: CoreMessage): string {
  // For user messages, store as plain text
  if (message.role === 'user') {
    return typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);
  }

  // For tool messages, format as array of tool results
  if (message.role === 'tool') {
    return JSON.stringify(
      message.content.map((content) => ({
        type: content.type || 'tool-result',
        toolCallId: content.toolCallId,
        toolName: content.toolName,
        result: content.result,
      }))
    );
  }

  // For assistant messages, format as array of text and tool calls
  if (message.role === 'assistant') {
    if (typeof message.content === 'string') {
      return JSON.stringify([{ type: 'text', text: message.content }]);
    }

    return JSON.stringify(
      message.content.map((content) => {
        if (content.type === 'text') {
          return {
            type: 'text',
            text: content.text,
          };
        }
        return {
          type: 'tool-call',
          toolCallId: content.toolCallId,
          toolName: content.toolName,
          args: content.args,
        };
      })
    );
  }

  return '';
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
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
  }>;
}

// Update the getWalletBalance tool
const getWalletBalance = {
  description: 'Get the balance of the connected wallet',
  parameters: z.object({
    address: z.string().describe('The wallet address to check'),
    chainId: z.number().describe('The chain ID of the connected wallet')
  }),
  execute: async ({ address, chainId }: { 
    address: string;
    chainId: number;
  }) => {
    try {
      // Get RPC URL based on chainId
      let rpcUrl: string;
      let networkName: string;
      
      switch (chainId) {
        case 8453: // Base Mainnet
          rpcUrl = 'https://mainnet.base.org';
          networkName = 'Base Mainnet';
          break;
        case 84532: // Base Sepolia
          rpcUrl = 'https://sepolia.base.org';
          networkName = 'Base Sepolia';
          break;
        default:
          throw new Error(`Unsupported chain ID: ${chainId}. Please connect to Base Mainnet or Base Sepolia.`);
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const balance = await provider.getBalance(address);
      
      // Get USDC contract address based on chainId
      const usdcAddress = chainId === 8453
        ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base Mainnet USDC
        : '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

      const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
      const usdcBalance = await usdcContract.balanceOf(address);
      
      return {
        address,
        network: networkName,
        chainId,
        balances: {
          eth: ethers.formatEther(balance),
          usdc: (Number(usdcBalance) / 1e6).toString()
        }
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return {
        error: 'Failed to fetch wallet balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

// Add interfaces for tool parameters
interface CreateDocumentParams {
  title: string;
}

interface UpdateDocumentParams {
  id: string;
  description: string;
}

interface RequestSuggestionsParams {
  documentId: string;
}

interface WeatherParams {
  latitude: number;
  longitude: number;
}

interface WalletBalanceParams {
  address: string;
  chainId: number;
}

// Update the tools object with proper typing
const tools = {
  getWeather: {
    description: 'Get the current weather at a location',
    parameters: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    execute: async ({ latitude, longitude }: WeatherParams) => {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
      );

      const weatherData = await response.json();
      return weatherData;
    }
  },
  createDocument: {
    description: 'Create a document for a writing activity',
    parameters: z.object({
      title: z.string(),
    }),
    execute: async ({ title }: CreateDocumentParams) => {
      const id = generateUUID();
      let draftText: string = '';
      const data = new StreamData();

      // Stream UI updates immediately for better UX
      data.append({ type: 'id', content: id });
      data.append({ type: 'title', content: title });
      data.append({ type: 'clear', content: '' });

      // Generate content
      const { fullStream } = await streamText({
        model: customModel(modelId),
        system:
          'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
        prompt: title,
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'text-delta') {
          draftText += delta.textDelta;
          // Stream content updates in real-time
          data.append({
            type: 'text-delta',
            content: delta.textDelta,
          });
        }
      }

      data.append({ type: 'finish', content: '' });

      const currentUser = await getUser();
      if (currentUser?.id) {
        await saveDocument({
          id,
          title,
          content: draftText,
          userId: currentUser.id,
        });
      }

      return {
        id,
        title,
        content: `A document was created and is now visible to the user.`,
      };
    },
  },
  updateDocument: {
    description: 'Update a document with the given description',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z.string().describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }: UpdateDocumentParams) => {
      const document = await getDocumentById(id);
      const data = new StreamData();

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      const { content: currentContent } = document;
      let draftText: string = '';

      data.append({
        type: 'clear',
        content: document.title,
      });

      const { fullStream } = await streamText({
        model: customModel(modelId),
        system:
          'You are a helpful writing assistant. Based on the description, please update the piece of writing.',
        experimental_providerMetadata: {
          openai: {
            prediction: {
              type: 'content',
              content: currentContent,
            },
          },
        },
        messages: [
          {
            role: 'user',
            content: description,
          },
          { role: 'user', content: currentContent },
        ],
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === 'text-delta') {
          const { textDelta } = delta;
          draftText += textDelta;
          data.append({
            type: 'text-delta',
            content: textDelta,
          });
        }
      }

      data.append({ type: 'finish', content: '' });

      const currentUser = await getUser();
      if (currentUser?.id) {
        await saveDocument({
          id,
          title: document.title,
          content: draftText,
          userId: currentUser.id,
        });
      }

      return {
        id,
        title: document.title,
        content: 'The document has been updated successfully.',
      };
    },
  },
  requestSuggestions: {
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z.string().describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }: RequestSuggestionsParams) => {
      const document = await getDocumentById(documentId);
      const data = new StreamData();

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      let suggestions: Array<{
        originalText: string;
        suggestedText: string;
        description: string;
        id: string;
        documentId: string;
        isResolved: boolean;
      }> = [];

      const { elementStream } = await streamObject({
        model: customModel(modelId),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        data.append({
          type: 'suggestion',
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
        id: documentId,
        title: document.title,
        message: 'Suggestions have been added to the document',
      };
    },
  },
  getWalletBalance
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
      return new Response('Unauthorized', { status: 401 });
    }

    const model = models.find((model) => model.id === modelId);

    if (!model) {
      return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    // Parse the message content to get wallet info
    let walletInfo: WalletMessageContent = { text: '' };
    try {
      if (typeof userMessage.content === 'string') {
        walletInfo = JSON.parse(userMessage.content);
        
        // Validate chainId
        if (!walletInfo.chainId || ![8453, 84532].includes(walletInfo.chainId)) {
          return new Response(
            JSON.stringify({ 
              error: 'Please connect to Base Mainnet (8453) or Base Sepolia (84532)' 
            }), 
            { status: 400 }
          );
        }
      }
    } catch (e) {
      console.error('Error parsing message content:', e);
    }

    // Create messages with wallet context
    const messagesWithContext = coreMessages.map(msg => {
      if (msg.role === 'user' && msg === userMessage) {
        return {
          ...msg,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
          walletAddress: walletInfo.walletAddress,
          chainId: walletInfo.chainId // Make sure chainId is passed
        };
      }
      return msg;
    });

    try {
      const chat = await getChatById(id);

      if (!chat) {
        const title = await generateTitleFromUserMessage({
          message: userMessage as unknown as { role: 'user'; content: string },
        });
        await saveChat({ id, userId: user.id, title });
      } else if (chat.user_id !== user.id) {
        return new Response('Unauthorized', { status: 401 });
      }

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

      const streamingData = new StreamData();

      const result = await streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: messagesWithContext, // Use the updated messages array
        maxSteps: 5,
        experimental_activeTools: allTools,
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

                    if (message.role === 'assistant') {
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
                  }
                ),
              });
            } catch (error) {
              console.error('Failed to save chat:', error);
            }
          }

          streamingData.close();
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      return result.toDataStreamResponse({
        data: streamingData,
      });
    } catch (error) {
      console.error('Error in chat route:', error);
      
      // Handle the duplicate chat ID case
      if (error instanceof Error && error.message === 'Chat ID already exists') {
        // If chat already exists, save the message and continue
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
        
        // Create new streaming data and continue with the chat
        const streamingData = new StreamData();
        const result = await streamText({
          model: customModel(model.apiIdentifier),
          system: systemPrompt,
          messages: messagesWithContext, // Use the updated messages array
          maxSteps: 5,
          experimental_activeTools: allTools,
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

                      if (message.role === 'assistant') {
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
                    }
                  ),
                });
              } catch (error) {
                console.error('Failed to save chat:', error);
              }
            }

            streamingData.close();
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        return result.toDataStreamResponse({
          data: streamingData,
        });
      }
      
      // Handle other errors
      return new Response(
        JSON.stringify({ error: 'Internal server error' }), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request' }), 
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const user = await getUser();

  try {
    const chat = await getChatById(id);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.user_id !== user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById(id, user.id);

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
