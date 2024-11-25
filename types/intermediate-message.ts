export type ThoughtProcess = {
  type: 'thinking' | 'planning' | 'reasoning' | 'searching' | 'executing';
  content: string;
  step?: number;
  totalSteps?: number;
}

export interface IntermediateMessage {
  id: string;
  role: 'system' | 'assistant';
  type: 'intermediate';
  thoughts: ThoughtProcess[];
  progress: number;
  status: 'active' | 'complete' | 'error';
  created_at: string;
  updated_at: string;
}

export interface TaskSequence {
  id: string;
  tasks: {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'complete' | 'error';
    result?: string;
    thoughts?: ThoughtProcess[];
  }[];
  currentTaskIndex: number;
  progress: number;
} 