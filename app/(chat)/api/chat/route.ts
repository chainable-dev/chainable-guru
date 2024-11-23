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

// Handle favicon requests
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.pathname === '/favicon.ico') {
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 404 });
}

export async function POST(request: Request) {
  const streamingData = new StreamData();
  
  try {
    const {
      id,
      messages,
      modelId,
    }: { id: string; messages: Message[]; modelId: string } = await request.json();

    const messagesWithContext = messages.map(message => ({
      ...message,
    }));

    const result = await streamText({
      model: customModel(modelId),
      messages: messagesWithContext,
      system: systemPrompt,
      maxSteps: 5,
      experimental_activeTools: allTools,
      tools,
    });

    const response = result.toDataStreamResponse({
      data: streamingData,
    });

    // Ensure stream is properly closed
    response.body?.on('end', () => {
      streamingData.close();
    });

    // Handle unexpected errors
    response.body?.on('error', (error) => {
      console.error('Stream error:', error);
      streamingData.close();
    });

    return response;

  } catch (error) {
    console.error('Error in chat route:', error);
    // Make sure to close the stream even if there's an error
    streamingData.close();
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
