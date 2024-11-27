import { ScrollArea } from "@/components/ui/scroll-area"
import { TaskCard } from "@/components/TaskCard"

interface Task {
  id: string
  title: string
  status: "running" | "completed" | "failed"
  progress: number
}

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
    </ScrollArea>
  )
} 