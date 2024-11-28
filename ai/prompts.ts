import { ChatCompletionFunctions } from 'openai-edge';

export const functions: ChatCompletionFunctions[] = [
  {
    name: 'get_crypto_price',
    description: 'Get current price and chart data for a cryptocurrency',
    parameters: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'The cryptocurrency symbol or name (e.g. BTC, Bitcoin, ETH, Ethereum)',
        },
        currency: {
          type: 'string',
          enum: ['USD', 'EUR', 'GBP'],
          description: 'The currency to get the price in',
          default: 'USD',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get_current_weather',
    description: 'Get current weather information for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state/country, e.g. San Francisco, CA',
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature to return',
          default: 'celsius',
        },
      },
      required: ['location'],
    },
  },
];

export const systemPrompt = `You are Elron, an AI assistant specializing in blockchain and cryptocurrency information.

Key Features:
1. Cryptocurrency Data: You can fetch real-time prices and charts for cryptocurrencies
2. Weather Information: You can provide current weather data for any location
3. Blockchain Knowledge: You understand blockchain technology, DeFi, NFTs, and Web3

Guidelines:
1. When asked about crypto prices, ALWAYS use the get_crypto_price function
2. For weather queries, ALWAYS use the get_current_weather function
3. Provide clear, concise responses with relevant data visualization when available
4. If a function call fails, gracefully explain the issue and suggest alternatives
5. For complex queries, break down your explanation into simple steps

Example interactions:
User: "What's the price of Bitcoin?"
Assistant: Let me fetch the current Bitcoin price and chart for you.
[Uses get_crypto_price function with {symbol: "BTC"}]

User: "How's the weather in London?"
Assistant: I'll check the current weather in London for you.
[Uses get_current_weather function with {location: "London, UK"}]

Remember to:
- Be helpful and informative
- Handle errors gracefully
- Provide context with data
- Use markdown formatting for better readability
- Stay within your knowledge domain`;

export const chatPrompt = `I am a user interested in cryptocurrency and blockchain technology. Please help me with my queries.`;

// Error handling messages
export const errorMessages = {
  rateLimitExceeded: "I apologize, but we've hit the rate limit for our data provider. Please try again in a minute.",
  cryptoNotFound: "I couldn't find that cryptocurrency. Please check the symbol/name and try again. You can use common names like 'Bitcoin' or symbols like 'BTC'.",
  networkError: "There seems to be a network issue. Let me try to get that information again.",
  generalError: "I encountered an issue while fetching that information. Could you please rephrase your request?",
};

// Function response templates
export const responseTemplates = {
  cryptoPrice: (data: any) => `
Here's the current information for ${data.name} (${data.symbol}):
- Price: ${data.currency} ${data.price.toLocaleString()}
- Market Cap Rank: #${data.marketCapRank}

I've also included a 7-day price chart below for your reference.
  `,
  weather: (data: any) => `
Current weather in ${data.location}:
- Temperature: ${data.temperature}°${data.unit}
- Condition: ${data.condition}
  `,
};
