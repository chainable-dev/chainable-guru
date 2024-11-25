import { estimateMessagesTokenCount } from './tokens'

type RateLimitOptions = {
  uniqueTokenPerInterval?: number
  interval?: number 
  tokensPerInterval?: number
}

type CacheEntry = {
  value: number
  timestamp: number
}

export default function createRateLimit(options?: RateLimitOptions) {
  const {
    uniqueTokenPerInterval = 500,
    interval = 60000,
    tokensPerInterval = 40000,
  } = options || {}

  // Use Map with timestamp-based expiry instead of LRUCache
  const requestCache = new Map<string, CacheEntry>()
  const tokenCache = new Map<string, CacheEntry>()

  const clearExpiredEntries = (cache: Map<string, CacheEntry>) => {
    const now = Date.now()
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > interval) {
        cache.delete(key)
      }
    }
  }

  return {
    check: async (token: string, messages: any[], maxTokens: number = 1000) => {
      clearExpiredEntries(requestCache)
      clearExpiredEntries(tokenCache)

      const now = Date.now()
      const currentRequests = requestCache.get(token)?.value || 0
      const currentTokens = tokenCache.get(token)?.value || 0
      
      const estimatedInputTokens = estimateMessagesTokenCount(messages)
      const totalEstimatedTokens = estimatedInputTokens + maxTokens

      if (currentRequests >= 3) {
        throw new Error('Rate limit exceeded: Too many requests per minute')
      }

      if (currentTokens + totalEstimatedTokens > tokensPerInterval) {
        throw new Error('Rate limit exceeded: Token limit reached')
      }

      requestCache.set(token, { value: currentRequests + 1, timestamp: now })
      tokenCache.set(token, { value: currentTokens + totalEstimatedTokens, timestamp: now })
    }
  }
}