import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';

import { functions, errorMessages, responseTemplates } from '@/ai/prompts';
import { getCoinPrice, getCoinMarketChart, searchCoins } from '@/app/lib/services/coingecko';
import { useModelSettings } from '@/lib/store/model-settings';
import { createClient } from '@/lib/supabase/client';

interface WeatherParams {
	location: string;
	unit?: 'celsius' | 'fahrenheit';
}

interface CryptoPriceParams {
	symbol: string;
	currency?: string;
}

interface ChartDataPoint {
	timestamp: number;
	price: number;
}

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

	for (let i = 0; i < maxRetries; i++) {
		try {
			const searchResults = await searchCoins(symbol);
			if (!searchResults.length) {
				throw new Error(errorMessages.cryptoNotFound);
			}

			const coin = searchResults[0];
			const price = await getCoinPrice(coin.id, currency.toLowerCase());
			const chartData = await getCoinMarketChart(coin.id, currency.toLowerCase(), 7);

			const formattedChartData = {
				timestamps: chartData.prices.map(([timestamp]: [number, number]) => timestamp),
				prices: chartData.prices.map(([, price]: [number, number]) => price),
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
		} catch (error) {
			lastError = error;
			logger.error(`Crypto price fetch attempt ${i + 1} failed`, error);
			
			if (error.message.includes('Rate limit exceeded')) {
				// Wait longer for rate limit errors
				await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
			} else if (i < maxRetries - 1) {
				// Wait less for other errors
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}

	throw lastError;
}

export async function POST(req: Request) {
	const json = await req.json();
	const { messages, previewToken } = json;
	const userId = headers().get('x-user-id');

	if (!userId) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const OPENAI_API_KEY = previewToken || process.env.OPENAI_API_KEY;
		if (!OPENAI_API_KEY) {
			return new Response('OpenAI API key not configured', { status: 500 });
		}

		const config = new Configuration({ apiKey: OPENAI_API_KEY });
		const openai = new OpenAIApi(config);
		const modelSettings = useModelSettings.getState();

		const response = await openai.createChatCompletion({
			model: modelSettings.model || 'gpt-3.5-turbo',
			messages: messages.map((message: any) => ({
				role: message.role,
				content: message.content,
			})),
			functions,
			function_call: 'auto',
			max_tokens: modelSettings.maxTokens || 1000,
			temperature: modelSettings.temperature || 0.7,
			stream: true,
		});

		const stream = OpenAIStream(response);
		return new StreamingTextResponse(stream);
	} catch (error: any) {
		console.error('Chat API error:', error);
		return new Response(error.message || 'Internal Server Error', { status: 500 });
	}
}
