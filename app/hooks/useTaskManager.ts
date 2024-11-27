import { useState, useEffect, useCallback } from 'react';
import { Task, TaskManager } from '@/lib/langchain/task-manager';
import { generateUUID } from '@/lib/utils';

const taskManager = new TaskManager(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');

export function useTaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskIds, setActiveTaskIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initial load of tasks
    setTasks(taskManager.getAllTasks());

    // Set up polling for task updates
    const interval = setInterval(() => {
      setTasks(taskManager.getAllTasks());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createTask = useCallback((
    input: string,
    type: Task['type'] = 'chat',
    priority: number = 1
  ) => {
    const taskId = generateUUID();
    const task: Omit<Task, 'status' | 'progress'> = {
      id: taskId,
      type,
      priority,
      input,
    };

    taskManager.addTask(task);
    setActiveTaskIds((prev) => new Set([...prev, taskId]));

    // Subscribe to task updates
    const subscription = taskManager.getTaskStream(taskId).subscribe({
      next: (updatedTask) => {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex((t) => t.id === taskId);
          if (taskIndex === -1) {
            return [...prevTasks, updatedTask];
          }
          const newTasks = [...prevTasks];
          newTasks[taskIndex] = updatedTask;
          return newTasks;
        });
      },
      complete: () => {
        setActiveTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      },
    });

    return {
      taskId,
      unsubscribe: () => subscription.unsubscribe(),
    };
  }, []);

  const getActiveTask = useCallback((taskId: string) => {
    return taskManager.getTask(taskId);
  }, []);

  const getActiveTasks = useCallback(() => {
    return Array.from(activeTaskIds).map((id) => taskManager.getTask(id)).filter(Boolean) as Task[];
  }, [activeTaskIds]);

  return {
    tasks,
    activeTasks: getActiveTasks(),
    createTask,
    getActiveTask,
  };
} 