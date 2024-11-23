import { CoreTool, Message } from 'ai';
import { z } from 'zod';
import { createDocument } from '@/lib/tools/document/createDocument';
import { getWalletBalance } from '@/lib/tools/wallet/getWalletBalance';
import { webSearch } from '@/lib/tools/search/webSearch';
import { FEATURES } from '@/lib/features';
import { StreamData } from 'ai';
import { systemPrompt } from '@/ai/prompts';
import { customModel } from '@/ai';
import { streamText } from '@/lib/utils/stream';

// Base tool schemas
const baseToolSchemas = {
  createDocument: z.object({
    title: z.string(),
    modelId: z.string()
  }),
  getWalletBalance: z.object({
    address: z.string(),
    chainId: z.number()
  })
} as const;

// Web search schema if enabled
const webSearchSchema = z.object({
  query: z.string(),
  searchType: z.enum(['duckduckgo', 'opensearch'])
});

// Combine schemas based on features
const toolSchemas = {
  ...baseToolSchemas,
  ...(FEATURES.WEB_SEARCH ? { webSearch: webSearchSchema } : {})
} as const;

// Type for allowed tools
type AllowedTools = keyof typeof toolSchemas;

// Available tools array - not readonly
const allTools: string[] = [
  'createDocument',
  'getWalletBalance',
  ...(FEATURES.WEB_SEARCH ? ['webSearch'] : [])
];

// Base tools implementation
const baseTools: Record<string, CoreTool> = {
  createDocument: {
    type: 'function',
    description: 'Create a new document',
    parameters: toolSchemas.createDocument,
    execute: async (args: z.infer<typeof toolSchemas.createDocument>, options: { abortSignal?: AbortSignal }) => {
      const result = await createDocument.execute(args);
      return result.result;
    }
  },
  getWalletBalance: {
    type: 'function',
    description: 'Get wallet balance',
    parameters: toolSchemas.getWalletBalance,
    execute: async (args: z.infer<typeof toolSchemas.getWalletBalance>, options: { abortSignal?: AbortSignal }) => {
      const result = await getWalletBalance.execute(args);
      return result.result;
    }
  }
};

// Add web search if enabled
const tools: Record<string, CoreTool> = FEATURES.WEB_SEARCH
  ? {
      ...baseTools,
      webSearch: {
        type: 'function',
        description: 'Search the web',
        parameters: webSearchSchema,
        execute: async (args: z.infer<typeof webSearchSchema>, options: { abortSignal?: AbortSignal }) => {
          if (!webSearch?.execute) {
            throw new Error('Web search not available');
          }
          const result = await webSearch.execute(args, { abortSignal: options.abortSignal });
          return result.result;
        }
      }
    }
  : baseTools;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      modelId,
    }: { id: string; messages: Message[]; modelId: string } = await request.json();

    // Create streaming data instance
    const streamingData = new StreamData();

    // Process messages for context
    const messagesWithContext = messages.map(message => ({
      ...message,
    }));

    const result = await streamText({
      model: customModel(modelId),
      messages: messagesWithContext,
      system: systemPrompt,
      maxSteps: 5,
      experimental_activeTools: allTools, // Now using mutable string array
      tools,
    });

    return result.toDataStreamResponse({
      data: streamingData,
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}
