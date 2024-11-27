import OpenAI from 'openai';
import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  NEXT_PUBLIC_OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
});

// OpenAI configuration type
export interface OpenAIConfig {
  apiKey: string;
  defaultModel: string;
  maxRetries: number;
  timeout: number;
}

// Default configuration
const DEFAULT_CONFIG: Partial<OpenAIConfig> = {
  defaultModel: 'gpt-4',
  maxRetries: 3,
  timeout: 30000,
};

// OpenAI client error types
export class OpenAIConfigError extends Error {
  constructor(message: string) {
    super(`OpenAI Configuration Error: ${message}`);
  }
}

// Create and validate configuration
export function createOpenAIConfig(): OpenAIConfig {
  try {
    const env = envSchema.parse(process.env);
    
    return {
      ...DEFAULT_CONFIG,
      apiKey: env.NEXT_PUBLIC_OPENAI_API_KEY,
    } as OpenAIConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new OpenAIConfigError(
        `Invalid environment variables: ${error.errors.map(e => e.message).join(', ')}`
      );
    }
    throw new OpenAIConfigError('Failed to create OpenAI configuration');
  }
}

// Create OpenAI client with configuration
export function createOpenAIClient() {
  const config = createOpenAIConfig();
  
  return new OpenAI({
    apiKey: config.apiKey,
    maxRetries: config.maxRetries,
    timeout: config.timeout,
  });
}

// Export singleton instance
export const openai = createOpenAIClient(); 