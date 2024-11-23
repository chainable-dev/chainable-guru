import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await limiter.check(request, 10);
    
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("query");

    if (!searchQuery) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Try each search provider in sequence until one works
    let searchError = null;
    let results = null;
    let source = '';

    for (const [providerName, provider] of Object.entries(searchProviders)) {
      try {
        const searchResult = await provider(searchQuery);
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
      if (searchQuery.toLowerCase().includes('blockchain') || searchQuery.toLowerCase().includes('crypto')) {
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
          query: searchQuery,
          source: 'Fallback',
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        results: [],
        query: searchQuery,
        error: "No results found",
        message: searchError?.message || "No matching results found",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      results: results.slice(0, 5),
      query: searchQuery,
      source,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Search error:", error);
    return NextResponse.json(
      { 
        error: "Failed to perform search",
        message: errorMessage,
        query: searchParams?.get("query"),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 