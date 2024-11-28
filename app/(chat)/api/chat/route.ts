import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';
import { getCoinPrice, getCoinMarketChart, searchCoins } from '@/app/lib/services/coingecko';
import { functions, errorMessages, responseTemplates } from '@/ai/prompts';
import { WeatherParams, CryptoPriceParams } from '@/app/lib/types/functions';

export const runtime = 'edge';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;

// Available models configuration
const MODELS = {
	'gpt-4': 'gpt-4',
	'gpt-4o-mini': 'gpt-4o-mini-2024-07-18',
	'gpt-4o': 'gpt-4o',
	'gpt-3.5-turbo': 'gpt-3.5-turbo-1106'
} as const;

// Rate limiting configuration
const RATE_LIMIT = {
	WINDOW_MS: 60000, // 1 minute
	MAX_REQUESTS: 100, // Maximum requests per window
	MAX_TOKENS: 100000 // Maximum tokens per window
};

// Logger function
const logger = {
	info: (message: string, data?: any) => {
		console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
	},
	error: (message: string, error: any) => {
		console.error(`[ERROR] ${message}:`, error);
		console.error('Stack trace:', error.stack);
	},
	warn: (message: string, data?: any) => {
		console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
	}
};

async function checkRateLimit(identifier: string) {
	try {
		const now = Date.now();
		const windowStart = now - RATE_LIMIT.WINDOW_MS;
		
		const usage = await kv.get<{ requests: number; tokens: number; timestamp: number }>(
			`ratelimit:${identifier}`
		) || { requests: 0, tokens: 0, timestamp: now };

		if (usage.timestamp < windowStart) {
			usage.requests = 0;
			usage.tokens = 0;
			usage.timestamp = now;
		}

		if (usage.requests >= RATE_LIMIT.MAX_REQUESTS) {
			logger.warn('Rate limit exceeded', { identifier, usage });
			throw new Error('Rate limit exceeded - too many requests');
		}
		if (usage.tokens >= RATE_LIMIT.MAX_TOKENS) {
			logger.warn('Token limit exceeded', { identifier, usage });
			throw new Error('Rate limit exceeded - token limit reached');
		}

		usage.requests++;
		await kv.set(`ratelimit:${identifier}`, usage, { ex: 60 });
		return usage;
	} catch (error) {
		logger.error('Rate limit check failed', error);
		throw error;
	}
}

// Function implementations
async function getCurrentWeather({ location, unit = 'celsius' }: WeatherParams) {
	try {
		logger.info('Fetching weather data', { location, unit });
		// This would normally call a weather API
		// For demo purposes, returning mock data
		return {
			location,
			temperature: 22,
			unit,
			condition: 'sunny',
		};
	} catch (error) {
		logger.error('Weather fetch failed', error);
		throw error;
	}
}

async function getCryptoPriceWithRetry({ symbol, currency = 'USD' }: CryptoPriceParams) {
	const maxRetries = 3;
	let lastError;

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			logger.info('Fetching crypto price', { symbol, currency, attempt });
			
			// Search for the coin ID
			const searchResults = await searchCoins(symbol);
			if (!searchResults.length) {
				throw new Error(errorMessages.cryptoNotFound);
			}

			const coin = searchResults[0];
			
			// Get current price
			const price = await getCoinPrice(coin.id, currency.toLowerCase());
			
			// Get historical data for chart
			const chartData = await getCoinMarketChart(coin.id, currency.toLowerCase(), 7);
			
			// Format the data for the chart
			const formattedChartData = {
				timestamps: chartData.prices.map(([timestamp]) => timestamp),
				prices: chartData.prices.map(([, price]) => price),
			};

			const response = {
				symbol: coin.symbol.toUpperCase(),
				name: coin.name,
				price,
				currency,
				chartData: formattedChartData,
				thumbnail: coin.thumb,
				marketCapRank: coin.market_cap_rank,
			};

			logger.info('Crypto price fetched successfully', { symbol, currency });
			return response;
		} catch (error: any) {
			lastError = error;
			logger.error(`Crypto price fetch attempt ${attempt} failed`, error);
			
			if (error.message.includes('Rate limit exceeded')) {
				// Wait longer for rate limit errors
				await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
			} else if (attempt < maxRetries) {
				// Wait less for other errors
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}

	throw lastError;
}

export async function POST(req: Request) {
	try {
		const { messages, modelId = 'gpt-4o-mini' } = await req.json();
		
		if (!messages || !Array.isArray(messages)) {
			throw new Error('Invalid messages format');
		}

		logger.info('Processing chat request', { modelId });

		// Get client identifier (IP address or user ID)
		const headersList = await headers();
		const forwardedFor = headersList.get('x-forwarded-for');
		const identifier = forwardedFor || 'anonymous';
		
		// Check rate limits
		await checkRateLimit(identifier);

		// Get the actual model identifier
		const actualModelId = MODELS[modelId as keyof typeof MODELS] || MODELS['gpt-4o-mini'];

		// Create OpenAI client with the provided API key
		const config = new Configuration({ apiKey: OPENAI_API_KEY });
		const openai = new OpenAIApi(config);

		try {
			// Make the request to OpenAI with model configuration and function calling
			const response = await openai.createChatCompletion({
				model: actualModelId,
				messages: messages.map((message: any) => ({
					role: message.role,
					content: message.content,
				})),
				functions,
				function_call: 'auto',
				max_tokens: 1000,
				temperature: 0.7,
				stream: true,
			});

			// Create a stream from the response
			const stream = OpenAIStream(response);
			return new StreamingTextResponse(stream);
		} catch (error: any) {
			logger.error('OpenAI API error:', error);
			
			if (error.response?.status === 401) {
				return new Response(
					JSON.stringify({ error: 'Invalid API key or unauthorized' }),
					{ status: 401, headers: { 'Content-Type': 'application/json' } }
				);
			}

			return new Response(
				JSON.stringify({ 
					error: error.message || 'OpenAI API error',
					details: error.response?.data || error.cause?.toString()
				}),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}
	} catch (error: any) {
		logger.error('Chat request failed', error);
		
		return new Response(
			JSON.stringify({ 
				error: error.message || 'Internal Server Error',
				details: error.cause?.toString()
			}),
			{ 
				status: error.status || 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}
