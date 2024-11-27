import { NextResponse } from 'next/server';
import { addAgentTask, getTaskProgress, getQueues } from '@/lib/bull/queues';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { type, input } = body;
    
    if (!type || !input) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const job = await addAgentTask({
      type,
      input,
      userId,
    });
    
    return NextResponse.json({ jobId: job.id });
    
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    
    // If jobId is provided, return specific task progress
    if (jobId) {
      const progress = await getTaskProgress(jobId);
      
      if (!progress) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(progress);
    }
    
    // Otherwise return all tasks
    const queues = getQueues()
    const queue = queues.agentTasks
    const jobs = await queue.getJobs(["active", "completed", "failed"])
    
    const tasks = await Promise.all(jobs.map(async (job) => {
      const progress = await job.progress()
      return {
        id: job.id,
        title: job.name,
        status: job.finishedOn ? (job.failedReason ? "failed" : "completed") : "running",
        progress: progress || 0
      }
    }))

    return NextResponse.json(tasks)
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 