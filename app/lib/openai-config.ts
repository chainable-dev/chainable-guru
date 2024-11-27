import { Configuration } from 'openai-edge';

export function getOpenAIConfig(customApiKey?: string) {
  const apiKey = customApiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return new Configuration({
    apiKey,
  });
} 