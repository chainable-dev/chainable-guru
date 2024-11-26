import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { BufferMemory } from "langchain/memory";

// Safety configurations
const MAX_OUTPUT_TOKENS = 2000;
const MAX_ITERATIONS = 5;
const TEMPERATURE = 0.7;
const TIMEOUT_MS = 30000;

console.log('Config: Initializing with safety configurations', {
  MAX_OUTPUT_TOKENS,
  MAX_ITERATIONS,
  TEMPERATURE,
  TIMEOUT_MS
});

// Initialize the OpenAI model with safety limits
export const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: TEMPERATURE,
  streaming: true,
  maxTokens: MAX_OUTPUT_TOKENS,
  timeout: TIMEOUT_MS,
});

console.log('Config: ChatOpenAI model initialized');

// Create custom tools for the agent with safety checks
const tools = [
  new DynamicTool({
    name: "blockchain_info",
    description: "Get information about blockchain state, balances, and transactions",
    func: async (input: string) => {
      console.log('Tool - blockchain_info: Executing with input:', input);
      try {
        // Add timeout for tool execution
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            console.log('Tool - blockchain_info: Timeout reached');
            reject(new Error('Tool execution timeout'))
          }, TIMEOUT_MS)
        );
        
        const executionPromise = Promise.resolve("Blockchain information retrieved");
        
        const result = await Promise.race([timeoutPromise, executionPromise]);
        console.log('Tool - blockchain_info: Execution completed successfully');
        return result;
      } catch (error) {
        console.error('Tool - blockchain_info: Error during execution:', error);
        throw error;
      }
    },
  }),
  new DynamicTool({
    name: "wallet_operations",
    description: "Perform wallet operations like checking balances and transactions",
    func: async (input: string) => {
      console.log('Tool - wallet_operations: Executing with input:', input);
      try {
        // Add timeout for tool execution
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            console.log('Tool - wallet_operations: Timeout reached');
            reject(new Error('Tool execution timeout'))
          }, TIMEOUT_MS)
        );
        
        const executionPromise = Promise.resolve("Wallet operation completed");
        
        const result = await Promise.race([timeoutPromise, executionPromise]);
        console.log('Tool - wallet_operations: Execution completed successfully');
        return result;
      } catch (error) {
        console.error('Tool - wallet_operations: Error during execution:', error);
        throw error;
      }
    },
  }),
];

console.log('Config: Tools initialized');

// Initialize the agent executor with safety measures
export const initializeAgent = async () => {
  console.log('Config: Initializing agent executor');
  try {
    const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
      agentType: "chat-conversational-react-description",
      memory: new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "input",
        outputKey: "output",
        maxTokens: MAX_OUTPUT_TOKENS,
      }),
      maxIterations: MAX_ITERATIONS,
      verbose: true,
    });

    console.log('Config: Agent executor initialized successfully');
    return executor;
  } catch (error) {
    console.error('Config: Error initializing agent executor:', error);
    throw error;
  }
}; 