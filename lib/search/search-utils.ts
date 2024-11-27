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

export async function searchDuckDuckGo(query: string) {
	if (!FEATURES.WEB_SEARCH) {
		throw new Error("Web search feature is not enabled");
	}

	try {
		const response = await fetch(
			`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
		);
		const data = await response.json();

		// Combine and truncate results to fit token limit
		const results =
			data.AbstractText +
			"\n\n" +
			data.RelatedTopics.map((topic: any) => topic.Text).join("\n");

		const tokenCount = countTokens(results);
		if (tokenCount > MAX_TOKENS) {
			return results.slice(
				0,
				Math.floor(results.length * (MAX_TOKENS / tokenCount)),
			);
		}

		return results;
	} catch (error) {
		console.error("DuckDuckGo search error:", error);
		return "Search failed. Please try again.";
	}
}

export async function searchOpenSearch(query: string) {
	if (!FEATURES.WEB_SEARCH) {
		throw new Error("Web search feature is not enabled");
	}

	try {
		// Using Bing Web Search API as an example
		const searchParams = new URLSearchParams({
			q: query,
			count: "5",
		});

		const response = await fetch(
			`https://api.bing.microsoft.com/v7.0/search?${searchParams}`,
			{
				headers: {
					"Ocp-Apim-Subscription-Key": process.env.BING_API_KEY || "",
				},
			},
		);

		const data = await response.json();
		const results = data.webPages.value
			.map((page: any) => `${page.name}\n${page.snippet}`)
			.join("\n\n");

		const tokenCount = countTokens(results);
		if (tokenCount > MAX_TOKENS) {
			return results.slice(
				0,
				Math.floor(results.length * (MAX_TOKENS / tokenCount)),
			);
		}

		return results;
	} catch (error) {
		console.error("OpenSearch error:", error);
		return "Search failed. Please try again.";
	}
}
