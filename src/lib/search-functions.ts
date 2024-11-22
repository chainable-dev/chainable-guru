import axios from 'axios';

export const webSearch = async (query: string) => {
  try {
    const response = await axios.get(`https://api.bing.microsoft.com/v7.0/search`, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY,
      },
      params: {
        q: query,
        count: 5
      }
    });
    
    return response.data.webPages.value.map((result: any) => ({
      title: result.name,
      url: result.url,
      snippet: result.snippet
    }));
  } catch (error) {
    console.error('Web search error:', error);
    return [];
  }
}; 