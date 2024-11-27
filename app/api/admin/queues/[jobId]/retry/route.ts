import { NextRequest, NextResponse } from 'next/server';
import { agentTaskQueue } from '@/lib/bull/queues';

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await agentTaskQueue.getJob(params.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await job.retry();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error retrying job:', error);
    return NextResponse.json(
      { error: 'Failed to retry job' },
      { status: 500 }
    );
  }
} 