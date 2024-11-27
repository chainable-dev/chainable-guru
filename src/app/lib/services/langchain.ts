import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence, RunnablePassthrough } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { logger } from "../logger";

// Initialize the OpenAI model with streaming
const model = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
  streaming: true,
});

// Create a prompt template for our chat
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are Elron, an AI assistant specializing in blockchain and cryptocurrency information."],
  new MessagesPlaceholder("history"),
  ["human", "{input}"],
]);

// Create a chain that includes intermediate steps
export const chain = RunnableSequence.from([
  {
    input: new RunnablePassthrough(),
    history: (input: { messages: any[] }) => 
      input.messages.map((m: any) => 
        m.role === "user" 
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
  },
  prompt,
  model,
  new StringOutputParser(),
]);

// Function to handle streaming with intermediate steps
export async function streamingChain(
  messages: any[],
  handlers: {
    onToken?: (token: string) => void;
    onStep?: (step: string) => void;
    onError?: (error: Error) => void;
    onFinish?: (output: string) => void;
  }
) {
  try {
    logger.info("Starting LangChain streaming chain");
    
    let fullResponse = "";
    
    // Stream the response
    await chain.stream({
      messages,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            fullResponse += token;
            handlers.onToken?.(token);
          },
          handleChainStart(chain: { name: string }) {
            logger.info(`Chain started: ${chain.name}`);
            handlers.onStep?.(`Starting ${chain.name}`);
          },
          handleChainEnd() {
            logger.info("Chain completed");
            handlers.onStep?.("Processing complete");
          },
          handleChainError(error: Error) {
            logger.error("Chain error:", error);
            handlers.onError?.(error);
          },
        },
      ],
    });

    handlers.onFinish?.(fullResponse);
    return fullResponse;
  } catch (error) {
    logger.error("Streaming chain error:", error);
    handlers.onError?.(error as Error);
    throw error;
  }
}

// Function to create a chain with specific tools
export function createToolChain(tools: any[]) {
  const toolPrompt = ChatPromptTemplate.fromMessages([
    ["system", `You are Elron, an AI assistant with access to the following tools: ${tools.map(t => t.name).join(", ")}`],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);

  return RunnableSequence.from([
    {
      input: new RunnablePassthrough(),
      history: (input: { messages: any[] }) => 
        input.messages.map((m: any) => 
          m.role === "user" 
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
        ),
    },
    toolPrompt,
    model,
    new StringOutputParser(),
  ]);
}

// Function to handle tool execution with streaming
export async function executeToolChain(
  chain: any,
  messages: any[],
  tools: any[],
  handlers: {
    onToken?: (token: string) => void;
    onStep?: (step: string) => void;
    onToolStart?: (tool: string) => void;
    onToolEnd?: (tool: string, result: any) => void;
    onError?: (error: Error) => void;
    onFinish?: (output: string) => void;
  }
) {
  try {
    logger.info("Starting tool chain execution");
    
    let fullResponse = "";
    
    await chain.stream({
      messages,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            fullResponse += token;
            handlers.onToken?.(token);
          },
          handleToolStart(tool: { name: string }) {
            logger.info(`Tool started: ${tool.name}`);
            handlers.onToolStart?.(tool.name);
          },
          handleToolEnd(output: any, runId: string, tool: { name: string }) {
            logger.info(`Tool completed: ${tool.name}`);
            handlers.onToolEnd?.(tool.name, output);
          },
          handleChainError(error: Error) {
            logger.error("Tool chain error:", error);
            handlers.onError?.(error);
          },
        },
      ],
    });

    handlers.onFinish?.(fullResponse);
    return fullResponse;
  } catch (error) {
    logger.error("Tool chain execution error:", error);
    handlers.onError?.(error as Error);
    throw error;
  }
} 