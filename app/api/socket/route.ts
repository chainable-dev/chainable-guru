import { Server as NetServer } from "http"
import { NextApiRequest } from "next"
import { Server as ServerIO } from "socket.io"
import { NextResponse } from "next/server"
import { getQueues } from "@/lib/bull/queues"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

let io: ServerIO | undefined

const queues = getQueues()
const queue = queues.agentTasks // Use the agentTasks queue directly

// Set up event listeners for the queue
queue.on("progress", (job, progress) => {
  io?.emit("taskProgress", {
    id: job.id,
    title: job.name,
    status: "running",
    progress
  })
})

queue.on("completed", (job) => {
  io?.emit("taskCompleted", {
    id: job.id,
    title: job.name,
    status: "completed",
    progress: 100
  })
})

queue.on("failed", (job, error) => {
  io?.emit("taskFailed", {
    id: job.id,
    title: job.name,
    status: "failed",
    progress: job.progress()
  })
})

export async function GET(req: Request, res: NextResponse) {
  if (!io) {
    const res = new NextResponse()
    const server = res.socket?.server as unknown as NetServer
    
    io = new ServerIO(server, {
      path: "/api/socket",
      addTrailingSlash: false,
    })

    res.socket.server.io = io
  }

  return NextResponse.json({ success: true })
} 