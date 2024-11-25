import { FEATURES } from "@/lib/features";
import GPT3TokenizerImport from "gpt3-tokenizer";

// Initialize tokenizer
const GPT3Tokenizer =
	typeof GPT3TokenizerImport === "function"
		? GPT3TokenizerImport
		: (GPT3TokenizerImport as any).default;
const tokenizer = new GPT3Tokenizer({ type: "gpt3" });

// Function to count tokens
function countTokens(text: string): number {
	const encoded = tokenizer.encode(text);
	return encoded.text.length;
}

// Limit tokens for search results to avoid overloading context
const MAX_TOKENS = 1000;

interface SearchResult {
	title: string;
	link: string;
	snippet: string;
}

export async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
	try {
		const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
		const data = await response.json();
		
		return data.RelatedTopics.map((topic: any) => ({
			title: topic.Text?.split(' - ')[0] || '',
			link: topic.FirstURL || '',
			snippet: topic.Text || ''
		})).slice(0, 5);
	} catch (error) {
		console.error('DuckDuckGo search error:', error);
		return [];
	}
}

export async function searchOpenSearch(query: string): Promise<SearchResult[]> {
	try {
		const response = await fetch('/api/search', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query })
		});
		
		if (!response.ok) {
			throw new Error('Search request failed');
		}
		
		const data = await response.json();
		return data.hits.map((hit: any) => ({
			title: hit._source.title || '',
			link: hit._source.url || '',
			snippet: hit._source.content || ''
		})).slice(0, 5);
	} catch (error) {
		console.error('OpenSearch error:', error);
		return [];
	}
}
