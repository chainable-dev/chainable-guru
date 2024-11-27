import { OpenAIStream, StreamingTextResponse } from 'ai';
import { Configuration, OpenAIApi } from 'openai-edge';
import { headers } from 'next/headers';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

const OPENAI_API_KEY = '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';

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

async function checkRateLimit(identifier: string) {
	const now = Date.now();
	const windowStart = now - RATE_LIMIT.WINDOW_MS;
	
	// Get current usage
	const usage = await kv.get<{ requests: number; tokens: number; timestamp: number }>(
		`ratelimit:${identifier}`
	) || { requests: 0, tokens: 0, timestamp: now };

	// Reset if outside window
	if (usage.timestamp < windowStart) {
		usage.requests = 0;
		usage.tokens = 0;
		usage.timestamp = now;
	}

	// Check limits
	if (usage.requests >= RATE_LIMIT.MAX_REQUESTS) {
		throw new Error('Rate limit exceeded - too many requests');
	}
	if (usage.tokens >= RATE_LIMIT.MAX_TOKENS) {
		throw new Error('Rate limit exceeded - token limit reached');
	}

	// Update usage
	usage.requests++;
	await kv.set(`ratelimit:${identifier}`, usage, { ex: 60 }); // Expire after 1 minute

	return usage;
}

export async function POST(req: Request) {
	try {
		const { messages, modelId = 'gpt-4o-mini' } = await req.json();
		
		if (!messages || !Array.isArray(messages)) {
			throw new Error('Invalid messages format');
		}

		// Get client identifier (IP address or user ID)
		const headersList = headers();
		const identifier = await headersList.get('x-forwarded-for') || 'anonymous';
		
		// Check rate limits
		await checkRateLimit(identifier);

		// Get the actual model identifier
		const actualModelId = MODELS[modelId as keyof typeof MODELS] || MODELS['gpt-4o-mini'];

		// Create OpenAI client with the provided API key
		const config = new Configuration({ apiKey: OPENAI_API_KEY });
		const openai = new OpenAIApi(config);

		// Make the request to OpenAI with model configuration
		const response = await openai.createChatCompletion({
			model: actualModelId,
			messages: messages.map((message: any) => ({
				role: message.role,
				content: message.content,
			})),
			max_tokens: 1000,
			temperature: 0.7,
			stream: true,
		});

		// Create a stream from the response
		const stream = OpenAIStream(response);

		// Return the stream response
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
