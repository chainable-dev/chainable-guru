import { kv } from '@vercel/kv'

// Type-safe key patterns
export const KEYS = {
  SESSION: (chatId: string) => `session:${chatId}`,
  WORKING: (taskId: string) => `working:${taskId}`,
  USER_PREFS: (userId: string) => `user:${userId}:prefs`,
  CONTEXT: (chatId: string) => `context:${chatId}`,
} as const

// TTL Constants in seconds
export const TTL = {
  SESSION: 1800,   // 30 minutes
  WORKING: 300,    // 5 minutes
  USER_PREFS: 86400, // 24 hours
  CONTEXT: 3600    // 1 hour
} as const

export const redis = kv

// Memory-aware helper functions
export async function setWithTTL<T>(
  key: string, 
  data: T, 
  ttl: number
): Promise<void> {
  try {
    await redis.set(key, data, { ex: ttl })
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error)
    throw error
  }
}

export async function getFromRedis<T>(key: string): Promise<T | null> {
  try {
    return redis.get<T>(key)
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error)
    throw error
  }
}

export async function deleteFromRedis(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error)
    throw error
  }
} 