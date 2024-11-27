import { Job } from 'bull';
import { agentTaskQueue, AgentTask } from './queues';

// Process agent tasks
agentTaskQueue.process(async (job: Job<AgentTask>) => {
  const { type, input, userId } = job.data;
  
  try {
    // Update progress to 0%
    await job.progress(0);
    console.log(`Job ${job.id} progress: 0`);

    // Validate input
    if (!input) {
      throw new Error(`Invalid input for ${type} task`);
    }

    // Update progress to 50%
    await job.progress(50);
    console.log(`Job ${job.id} progress: 50`);

    // Process task based on type
    let result;
    switch (type) {
      case 'chat':
        result = await processChat(input);
        break;
      case 'analysis':
        result = await processAnalysis(input);
        break;
      case 'search':
        result = await processSearch(input);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }

    // Update progress to 100%
    await job.progress(100);
    console.log(`Job ${job.id} progress: 100`);

    // Return success result
    return { success: true, result };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Mock task processors
async function processChat(input: any) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Processed chat task';
}

async function processAnalysis(input: any) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Processed analysis task';
}

async function processSearch(input: any) {
  if (!input) throw new Error('Invalid input for search task');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Processed search task';
}

// Handle worker errors
agentTaskQueue.on('error', (error) => {
  console.error('Worker error:', error);
});

// Handle failed jobs
agentTaskQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
}); 