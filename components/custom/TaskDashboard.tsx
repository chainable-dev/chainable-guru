"use client";

import { useEffect, useState } from 'react';
import { useTaskProgress } from '@/lib/hooks/useTaskProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Loader2, XCircle } from 'lucide-react';

interface Task {
  id: string;
  type: string;
  status: string;
  progress: number;
  message?: string;
  createdAt: Date;
}

export function TaskDashboard() {
  const { progress, startTask, isConnected, cancelTask } = useTaskProgress();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Demo task types for testing
  const demoTasks = [
    { type: 'chat', input: { message: 'Hello, how can I help?' } },
    { type: 'analysis', input: { data: 'Sample data for analysis' } },
    { type: 'search', input: { query: 'blockchain development' } },
  ];

  useEffect(() => {
    // Update tasks when progress changes
    const updatedTasks = Object.entries(progress).map(([jobId, taskProgress]) => ({
      id: jobId,
      type: taskProgress.type || 'unknown',
      status: taskProgress.progress === 100 ? 'completed' : 'running',
      progress: taskProgress.progress,
      message: taskProgress.message,
      createdAt: new Date(taskProgress.createdAt || Date.now()),
    }));

    setTasks(updatedTasks);
  }, [progress]);

  const handleStartTask = async (type: string, input: any) => {
    try {
      setLoading(true);
      await startTask(type, input);
      toast({
        title: 'Task Started',
        description: `Started ${type} task successfully`,
      });
    } catch (error) {
      console.error('Failed to start task:', error);
      toast({
        title: 'Error',
        description: 'Failed to start task',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      await cancelTask(taskId);
      toast({
        title: 'Task Cancelled',
        description: 'Task has been cancelled successfully',
      });
    } catch (error) {
      console.error('Failed to cancel task:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel task',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span>
            {isConnected ? 'Connected to server' : 'Disconnected from server'}
          </span>
        </div>
      </Card>

      {/* Task Controls */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Start New Task</h2>
        <div className="flex flex-wrap gap-4">
          {demoTasks.map((task, index) => (
            <Button
              key={index}
              onClick={() => handleStartTask(task.type, task.input)}
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Start {task.type} Task
            </Button>
          ))}
        </div>
      </Card>

      {/* Active Tasks */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono">{task.id}</TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="w-full max-w-xs">
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>{task.message}</TableCell>
                <TableCell>
                  {task.createdAt.toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {task.status !== 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelTask(task.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 