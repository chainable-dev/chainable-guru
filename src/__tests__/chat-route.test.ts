import { POST } from '@/app/api/chat/route';
import { getChatCompletion } from '@/lib/openai-functions';
import { webSearch } from '@/lib/search-functions';

jest.mock('@/lib/openai-functions');
jest.mock('@/lib/search-functions');

describe('Chat API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles normal chat completion', async () => {
    const mockCompletion = {
      choices: [{ message: { content: 'test response' } }]
    };

    (getChatCompletion as jest.Mock).mockResolvedValueOnce(mockCompletion);

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        enableSearch: false
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.message).toEqual(mockCompletion.choices[0].message);
  });

  it('handles web search function calls', async () => {
    const mockFunctionCall = {
      choices: [{
        function_call: {
          name: 'web_search',
          arguments: JSON.stringify({ query: 'test search' })
        }
      }]
    };

    const mockSearchResults = [
      { title: 'Test', url: 'https://test.com', snippet: 'Test snippet' }
    ];

    const mockFinalResponse = {
      choices: [{ message: { content: 'search response' } }]
    };

    (getChatCompletion as jest.Mock)
      .mockResolvedValueOnce(mockFunctionCall)
      .mockResolvedValueOnce(mockFinalResponse);
    (webSearch as jest.Mock).mockResolvedValueOnce(mockSearchResults);

    const request = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'search test' }],
        enableSearch: true
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.message).toEqual(mockFinalResponse.choices[0].message);
  });
}); 