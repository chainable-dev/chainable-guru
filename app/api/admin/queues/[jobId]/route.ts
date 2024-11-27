import { NextRequest, NextResponse } from 'next/server';
import { agentTaskQueue } from '@/lib/bull/queues';

// Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await agentTaskQueue.getJob(params.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const [state, progress] = await Promise.all([
      job.getState(),
      job.progress(),
    ]);

    return NextResponse.json({
      id: job.id,
      type: job.data.type,
      userId: job.data.userId,
      state,
      progress,
      createdAt: job.timestamp,
      result: job.returnvalue,
      error: job.failedReason,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

// Cancel job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await agentTaskQueue.getJob(params.jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await job.moveToFailed({ message: 'Cancelled by admin' });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
} 