import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/TaskList"

interface Task {
  id: string
  title: string
  status: "running" | "completed" | "failed"
  progress: number
}

interface TaskDashboardProps {
  tasks: Task[]
}

export function TaskDashboard({ tasks }: TaskDashboardProps) {
  const runningTasks = tasks.filter((task) => task.status === "running")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const failedTasks = tasks.filter((task) => task.status === "failed")

  return (
    <Tabs defaultValue="running" className="w-full">
      <TabsList>
        <TabsTrigger value="running">
          Running ({runningTasks.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({completedTasks.length})
        </TabsTrigger>
        <TabsTrigger value="failed">
          Failed ({failedTasks.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="running">
        <TaskList tasks={runningTasks} />
      </TabsContent>
      <TabsContent value="completed">
        <TaskList tasks={completedTasks} />
      </TabsContent>
      <TabsContent value="failed">
        <TaskList tasks={failedTasks} />
      </TabsContent>
    </Tabs>
  )
} 