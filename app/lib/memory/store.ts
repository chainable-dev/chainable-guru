import type { SessionMemory, UserPreferences } from '@/types';

class MemoryStoreImpl {
  async getSession(id: string): Promise<SessionMemory | null> {
    // Implementation
    return null;
  }

  async setSession(id: string, memory: SessionMemory): Promise<void> {
    // Implementation
  }

  async getUserPrefs(userId: string): Promise<UserPreferences | null> {
    // Implementation
    return null;
  }

  async setUserPrefs(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    // Implementation
  }

  async getWorking(id: string): Promise<any> {
    // Implementation
    return null;
  }
}

export const memoryStore = new MemoryStoreImpl(); 