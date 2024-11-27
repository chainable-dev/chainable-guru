import { EventEmitter } from 'events';
import { AgentTask, TaskProgress } from '../queues';

class MockJob {
  id: string;
  data: AgentTask;
  _progress: number = 0;
  _state: string = 'waiting';

  constructor(id: string, data: AgentTask) {
    this.id = id;
    this.data = data;
  }

  async progress(value?: number) {
    if (value !== undefined) {
      this._progress = value;
      mockQueue.emit('progress', this, value);
    }
    return this._progress;
  }

  async getState() {
    return this._state;
  }

  async remove() {
    return true;
  }

  async moveToFailed(error: any) {
    this._state = 'failed';
    mockQueue.emit('failed', this, error);
    return true;
  }
}

class MockQueue extends EventEmitter {
  private jobs: Map<string, MockJob> = new Map();
  private jobCounter: number = 0;

  async add(data: AgentTask) {
    const id = String(++this.jobCounter);
    const job = new MockJob(id, data);
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string) {
    return this.jobs.get(id) || null;
  }

  async getJobs(types: string[]) {
    return Array.from(this.jobs.values());
  }

  async clean(grace: number, type: string) {
    return true;
  }

  async close() {
    return true;
  }

  process(handler: (job: MockJob) => Promise<any>) {
    this.on('added', async (job: MockJob) => {
      try {
        const result = await handler(job);
        this.emit('completed', job, result);
      } catch (error) {
        this.emit('failed', job, error);
      }
    });
  }
}

export const mockQueue = new MockQueue();
export const agentTaskQueue = mockQueue;

// Mock Redis storage
const storage = new Map<string, any>();

export const addAgentTask = async (task: AgentTask) => {
  const job = await agentTaskQueue.add(task);
  storage.set(`task:${job.id}:metadata`, {
    type: task.type,
    userId: task.userId,
    createdAt: new Date().toISOString(),
  });
  mockQueue.emit('added', job);
  return job;
};

export const getTaskProgress = async (jobId: string): Promise<TaskProgress | null> => {
  const job = await agentTaskQueue.getJob(jobId);
  if (!job) return null;

  const metadata = storage.get(`task:${jobId}:metadata`) || {};
  return {
    progress: await job.progress(),
    state: await job.getState(),
    type: metadata.type,
    userId: metadata.userId,
    createdAt: metadata.createdAt,
  };
};

export const cancelTask = async (taskId: string): Promise<boolean> => {
  const job = await agentTaskQueue.getJob(taskId);
  if (!job) return false;

  try {
    await job.remove();
    storage.delete(`task:${taskId}:metadata`);
    return true;
  } catch (error) {
    console.error('Error cancelling task:', error);
    return false;
  }
};

export const listTasks = async (userId: string) => {
  const jobs = await agentTaskQueue.getJobs(['active', 'waiting', 'delayed']);
  return jobs
    .map(job => ({
      id: job.id,
      ...storage.get(`task:${job.id}:metadata`),
      state: job._state,
      progress: job._progress,
    }))
    .filter(task => task.userId === userId);
}; 