import { redis, KEYS, TTL } from '../redis'

interface CacheConfig {
  ttl: number
  maxSize?: number
  compression?: boolean
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccess: number
  size: number
}

export class CacheService {
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    ttl: TTL.SESSION,
    maxSize: 100 * 1024, // 100KB default max size
    compression: true
  }

  // Cache frequently used blockchain data
  static async cacheBlockchainData(
    key: string,
    data: any,
    config: Partial<CacheConfig> = {}
  ): Promise<void> {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config }
    
    const entry: CacheEntry<typeof data> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
      size: JSON.stringify(data).length
    }

    // Don't cache if exceeds max size
    if (fullConfig.maxSize && entry.size > fullConfig.maxSize) {
      console.warn(`Data size (${entry.size}) exceeds max cache size (${fullConfig.maxSize})`)
      return
    }

    try {
      await redis.set(
        `cache:blockchain:${key}`,
        entry,
        { ex: fullConfig.ttl }
      )
    } catch (error) {
      console.error('Failed to cache blockchain data:', error)
    }
  }

  // Smart caching for user preferences
  static async cacheUserPreferences(
    userId: string,
    preferences: Record<string, any>
  ): Promise<void> {
    try {
      // Only cache essential preferences
      const essentialPrefs = {
        model: preferences.model,
        theme: preferences.theme,
        network: preferences.network,
        lastUpdated: Date.now()
      }

      await redis.set(
        KEYS.USER_PREFS(userId),
        essentialPrefs,
        { ex: TTL.USER_PREFS }
      )
    } catch (error) {
      console.error('Failed to cache user preferences:', error)
    }
  }

  // Efficient context window caching
  static async cacheContextWindow(
    chatId: string,
    messages: Array<any>,
    windowSize: number = 10
  ): Promise<void> {
    try {
      // Keep only recent messages
      const recentMessages = messages.slice(-windowSize)
      
      // Calculate memory usage
      const memoryUsage = JSON.stringify(recentMessages).length

      // Compress if too large
      const shouldCompress = memoryUsage > 50 * 1024 // 50KB threshold

      const contextEntry: CacheEntry<typeof recentMessages> = {
        data: shouldCompress ? this.compressMessages(recentMessages) : recentMessages,
        timestamp: Date.now(),
        accessCount: 1,
        lastAccess: Date.now(),
        size: memoryUsage
      }

      await redis.set(
        `cache:context:${chatId}`,
        contextEntry,
        { ex: TTL.SESSION }
      )
    } catch (error) {
      console.error('Failed to cache context window:', error)
    }
  }

  // Compress messages for efficient storage
  private static compressMessages(messages: Array<any>): Array<any> {
    return messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' 
        ? msg.content.substring(0, 1000) // Limit content length
        : msg.content,
      timestamp: msg.timestamp
    }))
  }

  // Smart retrieval with automatic cleanup
  static async retrieveCache<T>(key: string): Promise<T | null> {
    try {
      const entry = await redis.get<CacheEntry<T>>(`cache:${key}`)
      
      if (!entry) return null

      // Update access metrics
      entry.accessCount++
      entry.lastAccess = Date.now()

      // Refresh TTL if frequently accessed
      if (entry.accessCount > 5) {
        await redis.set(
          `cache:${key}`,
          entry,
          { ex: TTL.SESSION }
        )
      }

      return entry.data
    } catch (error) {
      console.error('Failed to retrieve from cache:', error)
      return null
    }
  }

  // Cleanup old or unused cache entries
  static async cleanup(): Promise<void> {
    try {
      const keys = await redis.keys('cache:*')
      
      for (const key of keys) {
        const entry = await redis.get<CacheEntry<any>>(key)
        
        if (entry) {
          const age = Date.now() - entry.timestamp
          const inactive = Date.now() - entry.lastAccess > TTL.SESSION * 1000
          
          // Remove if old or inactive
          if (age > TTL.SESSION * 1000 || inactive) {
            await redis.del(key)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error)
    }
  }
} 