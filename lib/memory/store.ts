import type {ChatMessage, SessionContext, SessionMemory, UserPreferences} from '@/types';

class MemoryStoreImpl {
  private sessions: Map<string, SessionMemory> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  private workingData: Map<string, any> = new Map();

  async getSession(id: string): Promise<SessionMemory | null> {
    return this.sessions.get(id) || null;
  }

  async setSession(
    id: string,
    memory: { context: SessionContext; messages: Array<ChatMessage> }
  ): Promise<void> {
    this.sessions.set(id, memory);
  }

  async getUserPrefs(userId: string): Promise<UserPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  async setUserPrefs(
    userId: string,
    prefs: Partial<UserPreferences>
  ): Promise<void> {
    const existingPrefs = this.userPreferences.get(userId) || {};
    this.userPreferences.set(userId, <UserPreferences>{
      ...existingPrefs,
      ...prefs,
    });
  }

  async getWorking(id: string): Promise<any> {
    return this.workingData.get(id) || null;
  }

  // Additional method to set working data
  async setWorking(id: string, data: any): Promise<void> {
    this.workingData.set(id, data);
  }
}

export const memoryStore = new MemoryStoreImpl();
