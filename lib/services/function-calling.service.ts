import { z } from 'zod';
import { OpenAI } from 'openai';
import { openai } from '../openai/config';

// Function calling types
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  handler: (args: any) => Promise<any>;
}

export class FunctionCallingError extends Error {
  constructor(message: string) {
    super(`Function Calling Error: ${message}`);
  }
}

export class FunctionCallingService {
  private static instance: FunctionCallingService;
  private readonly functions: Map<string, FunctionDefinition>;

  private constructor() {
    this.functions = new Map();
  }

  public static getInstance(): FunctionCallingService {
    if (!FunctionCallingService.instance) {
      FunctionCallingService.instance = new FunctionCallingService();
    }
    return FunctionCallingService.instance;
  }

  registerFunction(definition: FunctionDefinition) {
    if (this.functions.has(definition.name)) {
      throw new FunctionCallingError(`Function ${definition.name} already registered`);
    }
    this.functions.set(definition.name, definition);
  }

  getFunction(name: string): FunctionDefinition {
    const func = this.functions.get(name);
    if (!func) {
      throw new FunctionCallingError(`Function ${name} not found`);
    }
    return func;
  }

  getAllFunctions(): FunctionDefinition[] {
    return Array.from(this.functions.values());
  }

  getFunctionDefinitions(): OpenAI.Chat.ChatCompletionCreateParams.Function[] {
    return Array.from(this.functions.values()).map(func => ({
      name: func.name,
      description: func.description,
      parameters: func.parameters.shape,
    }));
  }

  async handleFunctionCall(
    functionCall: OpenAI.Chat.ChatCompletionMessage.FunctionCall
  ): Promise<any> {
    try {
      const func = this.getFunction(functionCall.name);
      const args = JSON.parse(functionCall.arguments || '{}');
      
      // Validate arguments against schema
      const validatedArgs = func.parameters.parse(args);
      
      // Execute function
      return await func.handler(validatedArgs);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new FunctionCallingError(
          `Invalid arguments: ${error.errors.map(e => e.message).join(', ')}`
        );
      }
      if (error instanceof Error) {
        throw new FunctionCallingError(error.message);
      }
      throw new FunctionCallingError('Unknown error during function execution');
    }
  }

  async callWithFunctions({
    messages,
    functions,
    modelId = 'gpt-4o-mini',
  }: {
    messages: OpenAI.Chat.ChatCompletionMessageParam[];
    functions?: string[];
    modelId?: string;
  }) {
    try {
      const functionDefinitions = functions 
        ? functions.map(f => this.getFunction(f))
        : this.getAllFunctions();

      const response = await openai.chat.completions.create({
        model: modelId,
        messages,
        functions: functionDefinitions.map(f => ({
          name: f.name,
          description: f.description,
          parameters: f.parameters.shape,
        })),
        function_call: 'auto',
      });

      const functionCall = response.choices[0]?.message?.function_call;
      if (functionCall) {
        const result = await this.handleFunctionCall(functionCall);
        return { type: 'function_result', result };
      }

      return { 
        type: 'message', 
        content: response.choices[0]?.message?.content || '' 
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new FunctionCallingError(error.message);
      }
      throw new FunctionCallingError('Unknown error during function calling');
    }
  }
}

// Export singleton instance
export const functionCallingService = FunctionCallingService.getInstance(); 