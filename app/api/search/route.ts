import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

// Define search providers
const searchProviders = {
  async duckduckgo(query: string) {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Chainable Search Bot/1.0',
        },
        next: { revalidate: 3600 }
      }
    );

    if (!response.ok) throw new Error('DuckDuckGo search failed');
    
    const data = await response.json();
    return {
      results: [
        ...(data.Abstract ? [{
          Text: data.Abstract,
          FirstURL: data.AbstractURL,
          Source: data.AbstractSource,
          isAbstract: true,
        }] : []),
        ...(data.RelatedTopics?.map((topic: any) => ({
          Text: topic.Text,
          FirstURL: topic.FirstURL,
          Icon: topic.Icon?.URL,
        })) || [])
      ].filter((result: any) => result.Text && result.Text.trim()),
      source: 'DuckDuckGo'
    };
  },

  async serp(query: string) {
    const SERP_API_KEY = process.env.SERP_API_KEY;
    if (!SERP_API_KEY) throw new Error('SERP API key not configured');

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${SERP_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) throw new Error('SERP search failed');
    
    const data = await response.json();
    return {
      results: data.organic_results?.map((result: any) => ({
        Text: result.snippet,
        FirstURL: result.link,
        Title: result.title,
      })) || [],
      source: 'SERP'
    };
  }
} as const;

export async function GET(request: Request) {
  try {
    await limiter.check(request, 10);
    
    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Try each search provider in sequence until one works
    let searchError = null;
    let results = null;
    let source = '';

    for (const [providerName, provider] of Object.entries(searchProviders)) {
      try {
        const searchResult = await provider(query);
        if (searchResult.results && searchResult.results.length > 0) {
          results = searchResult.results;
          source = searchResult.source;
          break;
        }
      } catch (error) {
        console.error(`${providerName} search error:`, error);
        searchError = error instanceof Error ? error : new Error('Unknown error');
      }
    }

    // If no results found from any provider
    if (!results || results.length === 0) {
      // Provide a fallback response with blockchain-specific information
      if (query.toLowerCase().includes('blockchain') || query.toLowerCase().includes('crypto')) {
        return NextResponse.json({
          results: [{
            Text: "No recent results found. Here are some reliable blockchain resources:\n" +
                  "- CoinDesk (https://www.coindesk.com)\n" +
                  "- Cointelegraph (https://cointelegraph.com)\n" +
                  "- The Block (https://www.theblock.co)\n" +
                  "- Base Network News (https://base.mirror.xyz)",
            FirstURL: "https://base.org",
            isAbstract: true
          }],
          query,
          source: 'Fallback',
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        results: [],
        query,
        error: "No results found",
        message: searchError?.message || "No matching results found",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      results: results.slice(0, 5),
      query,
      source,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error("Search error:", error);
    const url = new URL(request.url);
    return NextResponse.json(
      { 
        error: "Failed to perform search",
        message: error instanceof Error ? error.message : "Unknown error",
        query: url.searchParams.get("query"),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 