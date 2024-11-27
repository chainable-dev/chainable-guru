import { NextResponse } from "next/server"
import { Queue } from "bull"
import { redis } from "@/lib/redis"

// Create a queue for test tasks
const testQueue = new Queue("test-tasks", {
  redis: {
    port: Number(process.env.REDIS_PORT) || 6379,
    host: process.env.REDIS_HOST || "localhost",
    password: process.env.REDIS_PASSWORD,
  },
})

export async function POST(request: Request) {
  try {
    const { duration, shouldFail } = await request.json()

    // Validate input
    if (typeof duration !== "number" || duration < 1 || duration > 30) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 30 seconds" },
        { status: 400 }
      )
    }

    // Add job to queue
    const job = await testQueue.add(
      "test-task",
      { duration, shouldFail },
      {
        attempts: 1,
        removeOnComplete: false,
        removeOnFail: false,
      }
    )

    return NextResponse.json({ jobId: job.id })
  } catch (error) {
    console.error("Error creating test task:", error)
    return NextResponse.json(
      { error: "Failed to create test task" },
      { status: 500 }
    )
  }
}

// Process test tasks
testQueue.process("test-task", async (job) => {
  const { duration, shouldFail } = job.data

  // Simulate progress updates
  for (let i = 0; i <= 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, (duration * 1000) / 10))
    await job.progress(i)
  }

  // Simulate failure if requested
  if (shouldFail) {
    throw new Error("Task failed as requested")
  }

  return { message: "Test task completed successfully" }
}) 