import { LRUCache } from 'lru-cache';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  });

  return {
    check: async (request: Request, limit: number) => {
      const ip = request.headers.get('x-forwarded-for') || 'anonymous';
      const tokenCount = (tokenCache.get(ip) as number[]) || [0];
      
      if (tokenCount[0] === 0) {
        tokenCache.set(ip, [1]);
      } else if (tokenCount[0] === limit) {
        throw new Error('Rate limit exceeded');
      } else {
        tokenCache.set(ip, [tokenCount[0] + 1]);
      }
      
      return true;
    },
  };
} 