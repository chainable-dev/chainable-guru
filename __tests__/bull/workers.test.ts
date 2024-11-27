import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { agentTaskQueue, addAgentTask } from '@/lib/bull/queues';
import '@/lib/bull/workers';

describe('Bull Worker System', () => {
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

  it('should process a chat task', async () => {
    const task = {
      type: 'chat' as const,
      input: { message: 'test' },
      userId: 'test-user'
    };

    const job = await addAgentTask(task);
    
    // Wait for job completion
    const result = await new Promise((resolve) => {
      agentTaskQueue.once('completed', (completedJob, jobResult) => {
        if (completedJob.id === job.id) {
          resolve(jobResult);
        }
      });
    });

    expect(result).toEqual({
      success: true,
      result: 'Processed chat task'
    });
  }, 5000); // 5 second timeout

  it('should update progress during task processing', async () => {
    const task = {
      type: 'analysis' as const,
      input: { data: 'test data' },
      userId: 'test-user',
    };

    const job = await addAgentTask(task);
    let progressUpdated = false;

    // Wait for progress update
    await new Promise((resolve) => {
      agentTaskQueue.once('progress', (progressJob, progress) => {
        if (progressJob.id === job.id && progress > 0) {
          progressUpdated = true;
          resolve(true);
        }
      });
    });

    expect(progressUpdated).toBe(true);
  }, 5000); // 5 second timeout

  it('should handle task failure gracefully', async () => {
    const task = {
      type: 'search' as const,
      input: null, // This should cause an error
      userId: 'test-user',
    };

    const job = await addAgentTask(task);
    
    // Wait for job failure
    await new Promise((resolve) => {
      agentTaskQueue.once('failed', (failedJob) => {
        if (failedJob.id === job.id) {
          resolve(true);
        }
      });
    });

    const state = await job.getState();
    expect(state).toBe('failed');
  }, 5000); // 5 second timeout
}); 