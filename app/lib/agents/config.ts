import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { DynamicTool } from "langchain/tools";
import { BufferMemory } from "langchain/memory";

// Initialize the OpenAI model
export const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
  temperature: 0.7,
  streaming: true,
});

// Create custom tools for the agent
const tools = [
  new DynamicTool({
    name: "blockchain_info",
    description: "Get information about blockchain state, balances, and transactions",
    func: async (input: string) => {
      // Implement blockchain data fetching logic here
      return "Blockchain information retrieved";
    },
  }),
  new DynamicTool({
    name: "wallet_operations",
    description: "Perform wallet operations like checking balances and transactions",
    func: async (input: string) => {
      // Implement wallet operations logic here
      return "Wallet operation completed";
    },
  }),
];

// Initialize the agent executor
export const initializeAgent = async () => {
  const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
    agentType: "chat-conversational-react-description",
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output",
    }),
    verbose: true,
  });

  return executor;
}; 