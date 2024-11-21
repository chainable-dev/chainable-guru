import { redis, KEYS, TTL, setWithTTL, getFromRedis } from '../redis'

// Memory types
export interface SessionMemory {
  chatId: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
  }>
  context: {
    wallet?: {
      address?: string
      chainId?: number
      network?: string
      isConnected: boolean
    }
    lastActive: number
    activeTools: string[]
  }
}

export interface WorkingMemory {
  taskId: string
  status: 'active' | 'completed' | 'failed'
  steps: {
    current: number
    total: number
    data: Record<string, any>
  }
  tools: {
    active: string[]
    completed: string[]
    results: Record<string, any>
  }
  createdAt: number
  updatedAt: number
}

export interface UserPreferences {
  userId: string
  model: string
  theme: 'light' | 'dark' | 'system'
  network?: string
  lastUpdated: number
}

export class MemoryStore {
  // Session memory operations
  static async getSession(chatId: string): Promise<SessionMemory | null> {
    try {
      return await getFromRedis<SessionMemory>(KEYS.SESSION(chatId))
    } catch (error) {
      console.error('Failed to get session memory:', error)
      return null
    }
  }

  static async setSession(chatId: string, data: SessionMemory): Promise<void> {
    try {
      await setWithTTL(KEYS.SESSION(chatId), {
        ...data,
        context: {
          ...data.context,
          lastActive: Date.now()
        }
      }, TTL.SESSION)
    } catch (error) {
      console.error('Failed to set session memory:', error)
      throw error
    }
  }

  // Working memory operations
  static async getWorking(taskId: string): Promise<WorkingMemory | null> {
    try {
      return await getFromRedis<WorkingMemory>(KEYS.WORKING(taskId))
    } catch (error) {
      console.error('Failed to get working memory:', error)
      return null
    }
  }

  static async setWorking(taskId: string, data: Partial<WorkingMemory>): Promise<void> {
    try {
      const existing = await this.getWorking(taskId)
      const updated: WorkingMemory = {
        ...(existing || {
          taskId,
          status: 'active',
          steps: { current: 0, total: 0, data: {} },
          tools: { active: [], completed: [], results: {} },
          createdAt: Date.now()
        }),
        ...data,
        updatedAt: Date.now()
      } as WorkingMemory

      await setWithTTL(KEYS.WORKING(taskId), updated, TTL.WORKING)
    } catch (error) {
      console.error('Failed to set working memory:', error)
      throw error
    }
  }

  // User preferences operations
  static async getUserPrefs(userId: string): Promise<UserPreferences | null> {
    try {
      return await getFromRedis<UserPreferences>(KEYS.USER_PREFS(userId))
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return null
    }
  }

  static async setUserPrefs(userId: string, data: Partial<UserPreferences>): Promise<void> {
    try {
      const existing = await this.getUserPrefs(userId)
      const updated: UserPreferences = {
        ...(existing || {
          userId,
          model: 'gpt-4',
          theme: 'system'
        }),
        ...data,
        lastUpdated: Date.now()
      }

      await setWithTTL(KEYS.USER_PREFS(userId), updated, TTL.USER_PREFS)
    } catch (error) {
      console.error('Failed to set user preferences:', error)
      throw error
    }
  }

  // Memory cleanup utilities
  static async cleanupSession(chatId: string): Promise<void> {
    const session = await this.getSession(chatId)
    if (!session) return

    // Keep only last 10 messages
    session.messages = session.messages.slice(-10)
    
    // Remove expired tools
    session.context.activeTools = session.context.activeTools.filter(tool => {
      const toolMemory = this.getWorking(tool)
      return toolMemory !== null
    })

    await this.setSession(chatId, session)
  }

  // Context window management
  static async getContextWindow(chatId: string, windowSize: number = 5): Promise<SessionMemory | null> {
    const session = await this.getSession(chatId)
    if (!session) return null

    return {
      ...session,
      messages: session.messages.slice(-windowSize)
    }
  }
} 