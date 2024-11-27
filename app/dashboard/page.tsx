"use client"

import { TaskDashboard } from "@/components/TaskDashboard"
import { TestInterface } from "@/components/custom/TestInterface"
import { useTaskProgress } from "@/lib/hooks/useTaskProgress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle2, XCircle } from "lucide-react"

export default function DashboardPage() {
  const { tasks } = useTaskProgress()

  const runningTasks = tasks.filter(task => task.status === "running")
  const completedTasks = tasks.filter(task => task.status === "completed")
  const failedTasks = tasks.filter(task => task.status === "failed")

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your background tasks</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Running Tasks</CardTitle>
            <Activity className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTasks.length}</div>
            <p className="text-xs text-muted-foreground">Active background processes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Successfully finished tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed Tasks</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Tasks that encountered errors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
            <CardDescription>View and manage all your background tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskDashboard tasks={tasks} />
          </CardContent>
        </Card>

        <TestInterface onTaskSubmit={() => {
          // This will trigger a refresh of the task list
          // The useTaskProgress hook will automatically fetch new tasks
        }} />
      </div>
    </div>
  )
} 