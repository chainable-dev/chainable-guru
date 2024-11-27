"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/lib/langchain/task-manager";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const activeTasks = tasks.filter(
    (task) => task.status === "running" || task.status === "pending"
  );
  const completedTasks = tasks.filter(
    (task) => task.status === "completed" || task.status === "failed"
  );

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <ScrollArea className="h-[300px]">
        <AnimatePresence>
          {activeTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={
                      task.status === "running"
                        ? "default"
                        : task.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {task.status}
                  </Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
                <p className="text-sm mb-2 line-clamp-2">{task.input}</p>
                <Progress value={task.progress} className="h-1" />
              </Card>
            </motion.div>
          ))}

          {completedTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4"
            >
              <Card
                className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                  task.status === "failed" ? "border-destructive" : ""
                }`}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant={task.status === "completed" ? "success" : "destructive"}
                  >
                    {task.status}
                  </Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
                <p className="text-sm mb-2 line-clamp-2">
                  {task.status === "failed" ? task.error : task.output}
                </p>
                {task.startTime && task.endTime && (
                  <p className="text-xs text-muted-foreground">
                    Completed in{" "}
                    {Math.round(
                      (task.endTime.getTime() - task.startTime.getTime()) / 1000
                    )}
                    s
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
} 