// Local imports first
import { generateTitleFromUserMessage } from '../../actions';

// Third-party imports
import OpenAI from 'openai';
import { v4 as generateUUID } from 'uuid';
import type { 
  ChatCompletion, 
  ChatCompletionCreateParams,
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption
} from 'openai/resources/chat';

// Type imports
import type { 
  ChatMessage, 
  WalletInfo, 
  SessionContext, 
  MetricsData,
  UserPreferences,
  MessageRole
} from '@/types';

// Lib imports
import { tools, getAvailableTools } from '@/lib/tools';
import { sanitizeResponseMessages } from '@/lib/utils';
import { memoryStore } from '@/lib/memory/store';

function getMostRecentUserMessage(messages: ChatMessage[]): ChatMessage | undefined {
  return [...messages].reverse().find(msg => msg.role === ('user' as MessageRole));
}

interface ToolCallParams {
  content?: string;
  walletInfo: WalletInfo;
  modelId?: string;
}

async function processToolCall(
  toolCall: ChatCompletionTool,
  params: ToolCallParams
) {
  if (!toolCall.function?.name) {
    throw new Error('Invalid tool call: missing function name');
  }

  const functionName = toolCall.function.name;
  const functionParams = typeof toolCall.function.parameters === 'object' 
    ? toolCall.function.parameters 
    : {};

  switch (functionName) {
    case 'createDocument':
      return await tools.createDocument.execute({
        ...params,
        content: typeof params.content === 'string' ? params.content : JSON.stringify(params.content)
      });
    default:
      throw new Error(`Unknown tool: ${functionName}`);
  }
}

function mapMessageRole(role: MessageRole): ChatCompletionMessage['role'] {
  if (role === 'tool') return 'assistant';
  return role as ChatCompletionMessage['role'];
}

interface OpenAIMessage extends Omit<ChatCompletionMessage, 'refusal'> {
  role: ChatCompletionMessage['role'];
  content: string;
}

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper functions to break down the main logic
async function getInitialData(id: string, user: any) {
  try {
    return await Promise.all([
      memoryStore.getSession(id),
      user?.id ? memoryStore.getUserPrefs(user.id) : null,
      memoryStore.getWorking(id)
    ]);
  } catch (error) {
    console.error('Error getting initial data:', error);
    throw error;
  }
}

async function processWalletInfo(userMessage: ChatMessage | undefined): Promise<WalletInfo> {
  try {
    if (!userMessage) {
      return { text: '', isConnected: false };
    }

    if (typeof userMessage.content === 'string') {
      try {
        const parsed = JSON.parse(userMessage.content);
        return { ...parsed, isConnected: !!parsed.walletAddress };
      } catch {
        return { text: userMessage.content, isConnected: false };
      }
    }
    /*
    *export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string | Record<string, unknown>;
  timestamp: number;
}
    
    */
    return { text: '', isConnected: false };
  } catch (error) {
    console.error('Error processing wallet info:', error);
    return { 
      text: typeof userMessage?.content === 'string' ? userMessage.content : '',
      isConnected: false 
    };
  }
}

async function handleToolCalls(
  response: AsyncIterable<ChatCompletionChunk>,
  userMessage: ChatMessage | undefined,
  currentWalletInfo: WalletInfo,
  modelId?: string
) {
  try {
    const toolResults = [];
    for await (const chunk of response) {
      const toolCall = chunk.choices[0]?.delta?.tool_calls?.[0];
      if (toolCall?.function?.name) {
        const result = await processToolCall({
          type: 'function',
          function: {
            name: toolCall.function.name,
            description: '',
            parameters: toolCall.function.arguments 
              ? JSON.parse(toolCall.function.arguments)
              : {}
          }
        } as ChatCompletionTool, {
          content: typeof userMessage?.content === 'string' 
            ? userMessage.content 
            : JSON.stringify(userMessage?.content),
          walletInfo: currentWalletInfo,
          modelId
        });
        toolResults.push({ toolCall, result });
      }
    }
    return toolResults;
  } catch (error) {
    console.error('Error handling tool calls:', error);
    throw error;
  }
}

async function updateSessionAndPreferences(
  id: string,
  messages: ChatMessage[],
  currentWalletInfo: WalletInfo,
  user: any
) {
  try {
    const sessionContext: SessionContext = {
      lastActive: Date.now(),
      wallet: currentWalletInfo.walletAddress ? {
        walletAddress: currentWalletInfo.walletAddress,
        chainId: currentWalletInfo.chainId,
        network: currentWalletInfo.chainId === 8453 ? 'Base Mainnet' :
                currentWalletInfo.chainId === 84532 ? 'Base Sepolia' :
                'Unknown',
        isConnected: true
      } : undefined,
      activeTools: []
    };
    await memoryStore.setSession(id, {
      messages: sanitizeResponseMessages(messages),
      context: sessionContext
    });

    if (user?.id) {
      await memoryStore.setUserPrefs(user.id, {
        lastChatId: id,
        lastActive: Date.now()
      });
    }
  } catch (error) {
    console.error('Error updating session and preferences:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  const id = generateUUID();
  const startTime = Date.now();
  let cacheHit = false;

  try {
    const { messages, walletInfo: initialWalletInfo, modelId, user } = await req.json();

    // Step 1: Get initial data
    const [sessionMemory, userPrefs, workingMemory] = await getInitialData(id, user);

    // Step 2: Process wallet info
    const userMessage = getMostRecentUserMessage(messages);
    const currentWalletInfo = await processWalletInfo(userMessage);

    // Step 3: Prepare and execute AI response
    const response = await openai.chat.completions.create({
      model: modelId || 'gpt-4',
      messages: messages.map((msg: ChatMessage): OpenAIMessage => ({
        role: mapMessageRole(msg.role),
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      tools: getAvailableTools(currentWalletInfo),
      temperature: 0.7,
      stream: true
    });

    // Step 4: Handle tool calls
    const toolResults = await handleToolCalls(
      response as unknown as AsyncIterable<ChatCompletionChunk>,
      userMessage,
      currentWalletInfo,
      modelId
    );

    // Step 5: Update session and preferences
    await updateSessionAndPreferences(id, messages, currentWalletInfo, user);

    // Step 6: Log metrics
    await MemoryMonitor.logMetrics(id, {
      responseTime: Date.now() - startTime,
      cacheHit
    });

    return new Response(JSON.stringify({ id, toolResults }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    await MemoryMonitor.logMetrics(id, {
      responseTime: Date.now() - startTime,
      cacheHit,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}
