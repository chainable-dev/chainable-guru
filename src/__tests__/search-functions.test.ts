import { webSearch } from '@/lib/search-functions';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('webSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return formatted search results', async () => {
    const mockResponse = {
      data: {
        webPages: {
          value: [
            {
              name: 'Test Title',
              url: 'https://test.com',
              snippet: 'Test snippet'
            }
          ]
        }
      }
    };

    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const results = await webSearch('test query');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.bing.microsoft.com/v7.0/search',
      expect.any(Object)
    );
    
    expect(results).toEqual([
      {
        title: 'Test Title',
        url: 'https://test.com',
        snippet: 'Test snippet'
      }
    ]);
  });

  it('should return empty array on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    const results = await webSearch('test query');

    expect(results).toEqual([]);
  });
}); 