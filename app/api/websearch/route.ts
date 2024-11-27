import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    // Use a search API (e.g., Google Custom Search API, Bing Web Search API)
    // For this example, we'll use DuckDuckGo's API
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await response.json();
    
    return NextResponse.json({
      results: data.RelatedTopics?.slice(0, 5).map((topic: any) => ({
        title: topic.Text,
        url: topic.FirstURL,
      })) || [],
    });
  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform web search' },
      { status: 500 }
    );
  }
} 