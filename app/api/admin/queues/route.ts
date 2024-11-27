import { NextResponse } from 'next/server';
import { agentTaskQueue } from '@/lib/bull/queues';

export async function GET() {
  try {
    // Get jobs from all states
    const [active, waiting, completed, failed, delayed] = await Promise.all([
      agentTaskQueue.getJobs(['active']),
      agentTaskQueue.getJobs(['waiting']),
      agentTaskQueue.getJobs(['completed']),
      agentTaskQueue.getJobs(['failed']),
      agentTaskQueue.getJobs(['delayed']),
    ]);

    // Combine all jobs and format them
    const jobs = [...active, ...waiting, ...completed, ...failed, ...delayed];
    const formattedJobs = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        type: job.data.type,
        userId: job.data.userId,
        state: await job.getState(),
        progress: await job.progress(),
        createdAt: job.timestamp,
        result: job.returnvalue,
        error: job.failedReason,
      }))
    );

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
} 