import { useEffect, useState } from "react"
import { useWebSocket } from "@/lib/hooks/useWebSocket"

interface Task {
  id: string
  title: string
  status: "running" | "completed" | "failed"
  progress: number
}

export function useTaskProgress() {
  const [tasks, setTasks] = useState<Task[]>([])
  const socket = useWebSocket()

  useEffect(() => {
    // Initial fetch of tasks
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error fetching tasks:", error))

    // Listen for task updates
    if (socket) {
      socket.on("taskProgress", (updatedTask: Task) => {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((task) => task.id === updatedTask.id)
          if (taskIndex === -1) {
            return [...prevTasks, updatedTask]
          }
          const newTasks = [...prevTasks]
          newTasks[taskIndex] = updatedTask
          return newTasks
        })
      })

      socket.on("taskCompleted", (completedTask: Task) => {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((task) => task.id === completedTask.id)
          if (taskIndex === -1) {
            return [...prevTasks, completedTask]
          }
          const newTasks = [...prevTasks]
          newTasks[taskIndex] = { ...completedTask, status: "completed", progress: 100 }
          return newTasks
        })
      })

      socket.on("taskFailed", (failedTask: Task) => {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((task) => task.id === failedTask.id)
          if (taskIndex === -1) {
            return [...prevTasks, failedTask]
          }
          const newTasks = [...prevTasks]
          newTasks[taskIndex] = { ...failedTask, status: "failed" }
          return newTasks
        })
      })
    }

    return () => {
      if (socket) {
        socket.off("taskProgress")
        socket.off("taskCompleted")
        socket.off("taskFailed")
      }
    }
  }, [socket])

  return { tasks }
} 