export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string | Record<string, unknown>;
  timestamp: number;
}

export interface MemoryStats {
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  itemCount: number;
  cacheHitRate: number;
  averageResponseTime: number;
}

export interface SessionContext {
  lastActive: number;
  wallet?: WalletInfo;
  activeTools: string[];
}

export interface SessionMemory {
  messages: ChatMessage[];
  context: SessionContext;
}

export type MemoryType = 'short' | 'long' | 'working';

export interface MemoryConfig {
  shortTerm: MemoryStore;
  longTerm: MemoryStore;
  working: MemoryStore;
}

export interface MemoryStore {
  setSession(id: string, memory: SessionMemory): Promise<void>;
  getSession(id: string): Promise<SessionMemory | null>;
  setUserPrefs(userId: string, prefs: Partial<UserPreferences>): Promise<void>;
  getUserPrefs(userId: string): Promise<UserPreferences | null>;
  uploadFile?(file: File, userId: string): Promise<string>;
  getFile?(userId: string, fileId: string): Promise<{ url: string; metadata: FileMetadata } | null>;
  listFiles?(userId: string): Promise<Array<{ url: string; metadata: FileMetadata }>>;
  deleteFile?(userId: string, fileId: string): Promise<void>;
}

export interface FileMetadata {
  filename: string;
  contentType: string;
  size: number;
  timestamp: number;
  compressed: boolean;
}

export interface WalletInfo {
  walletAddress?: string;
  chainId?: number;
  network?: string;
  isConnected: boolean;
  text?: string;
}

export interface MetricsData {
  responseTime: number;
  cacheHit: boolean;
  status?: 'error' | 'success';
  message?: string;
}

export interface UserPreferences {
  lastChatId: string;
  lastActive: number;
} 