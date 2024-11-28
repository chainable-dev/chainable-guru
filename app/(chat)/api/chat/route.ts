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

interface ModelSettingsState {
	model: string;
	maxTokens: number;
	temperature: number;
}

interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export const runtime = 'edge';

async function getCryptoPriceWithRetry({ symbol, currency = 'USD' }: CryptoPriceParams) {
	const maxRetries = 3;
	let lastError: Error | null = null;
	
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

			return { price, chartData: formattedChartData };
		} catch (error) {
			lastError = error instanceof Error ? error : new Error('Unknown error');
			console.error(`Crypto price fetch attempt ${i + 1} failed`, lastError);
			
			if (lastError.message.includes('Rate limit exceeded')) {
				await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
			} else if (i < maxRetries - 1) {
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}

	throw lastError || new Error('Failed to fetch crypto price');
}

export async function POST(req: Request) {
	const json = await req.json();
	const { messages, previewToken } = json;
	const headersList = headers();
	const userId = headersList.get('x-user-id');

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
		const modelSettings = useModelSettings.getState() as ModelSettingsState;

		const response = await openai.createChatCompletion({
			model: modelSettings.model || 'gpt-3.5-turbo',
			messages: messages.map((message: ChatMessage) => ({
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
	} catch (error) {
		console.error('Chat API error:', error);
		return new Response(
			error instanceof Error ? error.message : 'Internal Server Error',
			{ status: 500 }
		);
	}
}
