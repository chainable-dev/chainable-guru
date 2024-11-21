import OpenAI from 'openai';
import type { 
  ChatCompletion, 
  ChatCompletionCreateParams,
  ChatCompletionChunk,
  ChatCompletionMessage,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption
} from 'openai/resources/chat';
import { v4 as generateUUID } from 'uuid';

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
import { memoryStore } from '@/app/lib/memory/store';
import { MemoryMonitor } from '@/app/lib/memory/monitor';
import { tools, getAvailableTools } from '@/app/lib/tools';
import { sanitizeResponseMessages } from '@/app/lib/utils';

// Local imports
import { generateTitleFromUserMessage } from '../../actions';

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

export async function POST(req: Request) {
  const id = generateUUID();
  const startTime = Date.now();
  let cacheHit = false;

  try {
    const { messages, walletInfo: initialWalletInfo, modelId, user } = await req.json();

    // Get user preferences if available
    const [sessionMemory, userPrefs, workingMemory] = await Promise.all([
      memoryStore.getSession(id),
      user?.id ? memoryStore.getUserPrefs(user.id) : null,
      memoryStore.getWorking(id)
    ]);

    // Process wallet info from the latest message
    const userMessage = getMostRecentUserMessage(messages);
    let currentWalletInfo: WalletInfo = { text: '', isConnected: false };
    
    if (userMessage) {
      try {
        if (typeof userMessage.content === 'string') {
          try {
            const parsed = JSON.parse(userMessage.content);
            currentWalletInfo = { ...parsed, isConnected: !!parsed.walletAddress };
          } catch {
            currentWalletInfo = { text: userMessage.content, isConnected: false };
          }
        }
      } catch (e) {
        console.error('Error processing message content:', e);
        currentWalletInfo = { 
          text: typeof userMessage.content === 'string' ? userMessage.content : '',
          isConnected: false
        };
      }
    }

    // Prepare AI response
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

    // Handle streaming response
    for await (const chunk of response as unknown as AsyncIterable<ChatCompletionChunk>) {
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
      }
    }

    // Update session memory
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

    // Update user preferences if available
    if (user?.id) {
      await memoryStore.setUserPrefs(user.id, {
        lastChatId: id,
        lastActive: Date.now()
      });
    }

    // Log metrics
    await MemoryMonitor.logMetrics(id, {
      responseTime: Date.now() - startTime,
      cacheHit
    });

    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Log error metrics
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

