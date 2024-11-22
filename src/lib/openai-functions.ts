import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const searchFunctions = [
  {
    name: 'web_search',
    description: 'Search the web for current information',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query'
        }
      },
      required: ['query']
    }
  }
];

export const getChatCompletion = async (
  messages: any[],
  enableSearch: boolean = false
) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      functions: enableSearch ? searchFunctions : undefined,
      function_call: enableSearch ? 'auto' : undefined
    });

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}; 