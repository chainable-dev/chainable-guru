import { OpenAIStream } from '@/app/lib/openai-stream';
import { StreamingTextResponse } from 'ai';
import { getOpenAIConfig } from '@/app/lib/openai-config';
import { getCoinPrice, searchCoins, getCoinMarketChart } from '@/app/lib/services/coingecko';
import { functions } from '@/ai/prompts';

export const runtime = 'edge';

export async function POST(req: Request) {
	try {
		const { messages } = await req.json();
		
		if (!messages || !Array.isArray(messages)) {
			return new Response(
				JSON.stringify({ error: 'Invalid messages format' }),
				{ status: 400 }
			);
		}

		// Get OpenAI config
		const config = getOpenAIConfig();

		// Prepare the request body
		const body = {
			model: 'gpt-4-turbo-preview',
			messages,
			temperature: 0.7,
			stream: true,
			functions,
			function_call: 'auto',
		};

		// Create stream
		const stream = await OpenAIStream(body, { 
			apiKey: config.apiKey,
			async onFunctionCall({ name, arguments: args }) {
				if (name === 'get_crypto_price') {
					// Search for the coin first
					const searchResults = await searchCoins(args.symbol);
					if (!searchResults || searchResults.length === 0) {
						return `I couldn't find any cryptocurrency matching "${args.symbol}". Please try with a different symbol or name.`;
					}

					// Get the first (most relevant) result
					const coin = searchResults[0];
					const currency = (args.currency || 'USD').toLowerCase();

					try {
						// Get current price
						const price = await getCoinPrice(coin.id, currency);
						
						// Get chart data for 7 days
						const chartData = await getCoinMarketChart(coin.id, currency, 7);
						
						return JSON.stringify({
							symbol: coin.symbol.toUpperCase(),
							name: coin.name,
							price,
							currency: currency.toUpperCase(),
							chartData: {
								timestamps: chartData.prices.map(p => p[0]),
								prices: chartData.prices.map(p => p[1])
							},
							thumbnail: coin.thumb,
							marketCapRank: coin.market_cap_rank
						});
					} catch (error) {
						console.error('Error fetching crypto data:', error);
						return `I encountered an error while fetching data for ${coin.name}. This might be due to rate limiting or temporary API issues.`;
					}
				}
				return 'Function not implemented';
			}
		});

		// Return streaming response
		return new StreamingTextResponse(stream);

	} catch (error: any) {
		console.error('Chat API error:', error);
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
