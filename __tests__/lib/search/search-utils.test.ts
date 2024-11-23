import { describe, expect, it, beforeEach, vi } from 'vitest';
import { searchDuckDuckGo, searchOpenSearch } from '@/lib/search/search-utils';
import { FEATURES } from '@/lib/features';

vi.mock('@/lib/features', () => ({
  FEATURES: {
    WEB_SEARCH: true,
  },
}));

describe('Search Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchDuckDuckGo', () => {
    it('should return search results when successful', async () => {
      const mockResponse = {
        AbstractText: 'Test abstract',
        RelatedTopics: [{ Text: 'Related topic 1' }, { Text: 'Related topic 2' }],
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const results = await searchDuckDuckGo('test query');
      expect(results).toBe('Test abstract\n\nRelated topic 1\nRelated topic 2');
    });

    it('should handle errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      const results = await searchDuckDuckGo('test query');
      expect(results).toBe('Search failed. Please try again.');
    });
  });

  describe('searchOpenSearch', () => {
    it('should return search results when successful', async () => {
      const mockResponse = {
        webPages: {
          value: [
            { name: 'Page 1', snippet: 'Snippet 1' },
            { name: 'Page 2', snippet: 'Snippet 2' },
          ],
        },
      };

      global.fetch = vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const results = await searchOpenSearch('test query');
      expect(results).toBe('Page 1\nSnippet 1\n\nPage 2\nSnippet 2');
    });

    it('should handle errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      const results = await searchOpenSearch('test query');
      expect(results).toBe('Search failed. Please try again.');
    });
  });
}); 