export interface Task {
  id: string;
  user_id: string;
  type: 'chat' | 'analysis' | 'research';
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: string;
  output?: string;
  error?: string;
  progress: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'created_at'>;
        Update: Partial<Omit<Task, 'id' | 'created_at'>>;
      };
      // ... existing tables ...
    };
  };
}; 