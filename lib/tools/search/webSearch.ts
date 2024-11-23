import { z } from 'zod';
import { CoreTool } from 'ai';

// Define the schema
const webSearchSchema = z.object({
  query: z.string().describe('The search query'),
  searchType: z.enum(['duckduckgo', 'opensearch']).describe('The search engine to use')
});

// Define the result type
interface WebSearchResult {
  searchEngine: 'duckduckgo' | 'opensearch';
  query: string;
  results: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
  timestamp: string;
}

// Create the tool with proper typing
export const webSearch: CoreTool = {
  type: 'function',
  description: 'Search the web using DuckDuckGo or OpenSearch',
  parameters: webSearchSchema,
  execute: async (args: z.infer<typeof webSearchSchema>) => {
    try {
      const { query, searchType } = args;
      
      // Mock implementation for now
      const results = {
        searchEngine: searchType,
        query,
        results: [{
          title: 'Example Result',
          snippet: 'Example snippet',
          url: 'https://example.com'
        }],
        timestamp: new Date().toISOString()
      };

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}; 