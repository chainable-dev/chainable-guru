import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { agentTaskQueue, addAgentTask, getTaskProgress, cancelTask, listTasks } from '@/lib/bull/queues';

describe('Bull Queue System', () => {
  beforeAll(async () => {
    // Clear all jobs before testing
    await agentTaskQueue.clean(0, 'completed');
    await agentTaskQueue.clean(0, 'failed');
    await agentTaskQueue.clean(0, 'delayed');
    await agentTaskQueue.clean(0, 'active');
    await agentTaskQueue.clean(0, 'wait');
  });

  afterAll(async () => {
    // Clean up after tests
    await agentTaskQueue.close();
  });

  it('should add a task to the queue', async () => {
    const task = {
      type: 'chat' as const,
      input: { message: 'test message' },
      userId: 'test-user',
    };

    const job = await addAgentTask(task);
    expect(job.id).toBeDefined();
    expect(job.data).toEqual(task);
  });

  it('should get task progress', async () => {
    const task = {
      type: 'chat' as const,
      input: { message: 'test message' },
      userId: 'test-user',
    };

    const job = await addAgentTask(task);
    const progress = await getTaskProgress(job.id);

    expect(progress).toBeDefined();
    expect(progress?.progress).toBe(0);
    expect(progress?.type).toBe('chat');
  });

  it('should cancel a task', async () => {
    const task = {
      type: 'chat' as const,
      input: { message: 'test message' },
      userId: 'test-user',
    };

    const job = await addAgentTask(task);
    const cancelled = await cancelTask(job.id);
    expect(cancelled).toBe(true);

    const progress = await getTaskProgress(job.id);
    expect(progress).toBeNull();
  });

  it('should list tasks for a user', async () => {
    const userId = 'test-user-' + Date.now(); // Unique user ID to avoid conflicts
    const tasks = [
      { type: 'chat' as const, input: { message: '1' }, userId },
      { type: 'analysis' as const, input: { data: '2' }, userId },
      { type: 'search' as const, input: { query: '3' }, userId: 'other-user' },
    ];

    for (const task of tasks) {
      await addAgentTask(task);
    }

    const userTasks = await listTasks(userId);
    expect(userTasks).toHaveLength(2);
    expect(userTasks.every(t => t.userId === userId)).toBe(true);
  });
}); 