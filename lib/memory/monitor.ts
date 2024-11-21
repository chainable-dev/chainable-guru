import { redis, KEYS } from '../redis'
import type { SessionMemory, WorkingMemory, UserPreferences } from './store'

export interface MemoryStats {
  sessions: {
    active: number
    total: number
    avgMessageCount: number
  }
  working: {
    active: number
    completed: number
    failed: number
  }
  users: {
    active: number
    preferences: {
      models: Record<string, number>
      themes: Record<string, number>
    }
  }
  performance: {
    avgResponseTime: number
    cacheHitRate: number
  }
}

export class MemoryMonitor {
  static async getStats(): Promise<MemoryStats> {
    try {
      // Get all session keys
      const sessionKeys = await redis.keys(KEYS.SESSION('*'))
      const workingKeys = await redis.keys(KEYS.WORKING('*'))
      const userKeys = await redis.keys(KEYS.USER_PREFS('*'))

      // Fetch all memories in parallel
      const [sessions, working, users] = await Promise.all([
        Promise.all(sessionKeys.map(key => redis.get<SessionMemory>(key))),
        Promise.all(workingKeys.map(key => redis.get<WorkingMemory>(key))),
        Promise.all(userKeys.map(key => redis.get<UserPreferences>(key)))
      ])

      // Calculate statistics
      const stats: MemoryStats = {
        sessions: {
          active: sessions.filter(s => s && Date.now() - s.context.lastActive < 1800000).length,
          total: sessions.length,
          avgMessageCount: sessions.reduce((acc, s) => acc + (s?.messages.length || 0), 0) / sessions.length || 0
        },
        working: {
          active: working.filter(w => w?.status === 'active').length,
          completed: working.filter(w => w?.status === 'completed').length,
          failed: working.filter(w => w?.status === 'failed').length
        },
        users: {
          active: users.length,
          preferences: {
            models: users.reduce((acc, u) => {
              if (u?.model) {
                acc[u.model] = (acc[u.model] || 0) + 1
              }
              return acc
            }, {} as Record<string, number>),
            themes: users.reduce((acc, u) => {
              if (u?.theme) {
                acc[u.theme] = (acc[u.theme] || 0) + 1
              }
              return acc
            }, {} as Record<string, number>)
          }
        },
        performance: {
          avgResponseTime: 0, // Will be calculated from metrics
          cacheHitRate: 0     // Will be calculated from metrics
        }
      }

      return stats
    } catch (error) {
      console.error('Failed to get memory stats:', error)
      throw error
    }
  }

  static async cleanup(): Promise<void> {
    try {
      // Cleanup old sessions
      const sessionKeys = await redis.keys(KEYS.SESSION('*'))
      const sessions = await Promise.all(
        sessionKeys.map(async key => {
          const session = await redis.get<SessionMemory>(key)
          if (session && Date.now() - session.context.lastActive > 1800000) {
            await redis.del(key)
            return key
          }
          return null
        })
      )

      // Cleanup completed/failed working memory
      const workingKeys = await redis.keys(KEYS.WORKING('*'))
      const working = await Promise.all(
        workingKeys.map(async key => {
          const work = await redis.get<WorkingMemory>(key)
          if (work && ['completed', 'failed'].includes(work.status)) {
            await redis.del(key)
            return key
          }
          return null
        })
      )

      console.log('Memory cleanup completed:', {
        sessionsRemoved: sessions.filter(Boolean).length,
        workingRemoved: working.filter(Boolean).length
      })
    } catch (error) {
      console.error('Failed to cleanup memories:', error)
      throw error
    }
  }

  static async logMetrics(chatId: string, metrics: {
    responseTime: number
    cacheHit: boolean
  }): Promise<void> {
    try {
      const key = `metrics:${chatId}`
      await redis.lpush(key, JSON.stringify({
        ...metrics,
        timestamp: Date.now()
      }))
      await redis.ltrim(key, 0, 99) // Keep last 100 metrics
    } catch (error) {
      console.error('Failed to log metrics:', error)
    }
  }
} 