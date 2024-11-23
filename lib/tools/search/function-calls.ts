import { createFunctionCall } from '../types/function-calls';

export const webSearchFunctionCall = createFunctionCall(
  'webSearch',
  'Search the web using DuckDuckGo or OpenSearch',
  {
    query: {
      type: 'string',
      description: 'The search query',
      required: true
    },
    searchType: {
      type: 'string',
      description: 'The search engine to use',
      enum: ['duckduckgo', 'opensearch'],
      required: true
    }
  }
); 