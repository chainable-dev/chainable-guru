import Queue from 'bull';
import { Redis } from 'ioredis';

// Define task types
export type AgentTask = {
  type: 'chat' | 'analysis' | 'search';
  input: any;
  userId: string;
};

export type TaskProgress = {
  progress: number;
  state: string;
  type: string;
  userId: string;
  createdAt: string;
};

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 100, 3000),
});

// Create queue instance
export const agentTaskQueue = new Queue<AgentTask>('agent-tasks', {
  redis: {
    port: 6379,
    host: '127.0.0.1',
    maxRetriesPerRequest: null,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Store task metadata in Redis
const taskMetadataKey = (jobId: string) => `task:${jobId}:metadata`;

// Add task to queue
export const addAgentTask = async (task: AgentTask) => {
  const job = await agentTaskQueue.add(task);
  
  // Store task metadata
  await redis.hmset(taskMetadataKey(job.id), {
    type: task.type,
    userId: task.userId,
    createdAt: new Date().toISOString(),
  });
  
  return job;
};

// Get task progress
export const getTaskProgress = async (jobId: string): Promise<TaskProgress | null> => {
  const job = await agentTaskQueue.getJob(jobId);
  if (!job) return null;
  
  const progress = await job.progress();
  const state = await job.getState();
  const metadata = await redis.hgetall(taskMetadataKey(jobId));
  
  return {
    progress,
    state,
    type: metadata.type,
    userId: metadata.userId,
    createdAt: metadata.createdAt,
  };
};

// Cancel task
export const cancelTask = async (taskId: string): Promise<boolean> => {
  const job = await agentTaskQueue.getJob(taskId);
  if (!job) return false;
  
  try {
    const state = await job.getState();
    
    switch (state) {
      case 'active':
        await job.moveToFailed({ message: 'Task cancelled by user' });
        break;
      case 'waiting':
      case 'delayed':
      case 'paused':
        await job.remove();
        break;
      default:
        return false;
    }
    
    await redis.del(taskMetadataKey(job.id));
    return true;
  } catch (error) {
    console.error('Error cancelling task:', error);
    return false;
  }
};

// List tasks for a user
export const listTasks = async (userId: string) => {
  const jobs = await agentTaskQueue.getJobs(['active', 'waiting', 'delayed']);
  const tasks = await Promise.all(
    jobs.map(async (job) => {
      const progress = await job.progress();
      const state = await job.getState();
      const metadata = await redis.hgetall(taskMetadataKey(job.id));
      
      return {
        id: job.id,
        type: metadata.type,
        userId: metadata.userId,
        state,
        progress,
        createdAt: metadata.createdAt,
      };
    })
  );
  
  return tasks.filter(task => task.userId === userId);
};

// Queue event handlers
agentTaskQueue.on('completed', async (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
  await redis.del(taskMetadataKey(job.id));
});

agentTaskQueue.on('failed', async (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
  await redis.del(taskMetadataKey(job.id));
});

agentTaskQueue.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress:`, progress);
});

// Get all available queues
export const getQueues = () => ({
  agentTasks: agentTaskQueue,
});
  