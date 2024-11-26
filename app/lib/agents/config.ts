import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { BufferMemory } from "langchain/memory";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RunnableSequence } from "langchain/schema/runnable";

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

// Initialize different OpenAI models for specialized tasks
export const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: TEMPERATURE,
  streaming: true,
  maxTokens: MAX_OUTPUT_TOKENS,
  timeout: TIMEOUT_MS,
});

export const plannerModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.3, // Lower temperature for more focused planning
  streaming: true,
  maxTokens: MAX_OUTPUT_TOKENS,
  timeout: TIMEOUT_MS,
});

export const executorModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.5,
  streaming: true,
  maxTokens: MAX_OUTPUT_TOKENS,
  timeout: TIMEOUT_MS,
});

// Create specialized tools for different agents
const blockchainTools = [
  new DynamicTool({
    name: "blockchain_info",
    description: "Get information about blockchain state, balances, and transactions",
    func: async (input: string) => {
      console.log('Tool - blockchain_info: Executing with input:', input);
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tool execution timeout')), TIMEOUT_MS)
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
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Tool execution timeout')), TIMEOUT_MS)
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

// Create a planner agent that breaks down complex tasks
export const createPlannerAgent = async () => {
  console.log('Config: Creating planner agent');
  return await initializeAgentExecutorWithOptions([...blockchainTools], plannerModel, {
    agentType: "chat-conversational-react-description",
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "planner_history",
      inputKey: "input",
      outputKey: "output",
    }),
    maxIterations: MAX_ITERATIONS,
    verbose: true,
  });
};

// Create an executor agent that carries out specific tasks
export const createExecutorAgent = async () => {
  console.log('Config: Creating executor agent');
  return await initializeAgentExecutorWithOptions([...blockchainTools], executorModel, {
    agentType: "chat-conversational-react-description",
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "executor_history",
      inputKey: "input",
      outputKey: "output",
    }),
    maxIterations: MAX_ITERATIONS,
    verbose: true,
  });
};

// Create a coordinator that manages the interaction between agents
export const createAgentCoordinator = async () => {
  const planner = await createPlannerAgent();
  const executor = await createExecutorAgent();

  const coordinator = RunnableSequence.from([
    {
      planner: async (input: { messages: BaseMessage[] }) => {
        console.log('Coordinator: Planning phase started');
        const result = await planner.call({ input: input.messages[input.messages.length - 1].content });
        console.log('Coordinator: Planning phase completed');
        return result.output;
      },
      executor: async (input: { messages: BaseMessage[], plan: string }) => {
        console.log('Coordinator: Execution phase started');
        const result = await executor.call({ input: input.plan });
        console.log('Coordinator: Execution phase completed');
        return result.output;
      }
    },
    async ({ planner, executor }) => {
      return { plan: planner, result: executor };
    }
  ]);

  return coordinator;
};

// Initialize the multi-agent system
export const initializeAgent = async () => {
  console.log('Config: Initializing multi-agent system');
  try {
    const coordinator = await createAgentCoordinator();
    console.log('Config: Multi-agent system initialized successfully');
    return coordinator;
  } catch (error) {
    console.error('Config: Error initializing multi-agent system:', error);
    throw error;
  }
}; 