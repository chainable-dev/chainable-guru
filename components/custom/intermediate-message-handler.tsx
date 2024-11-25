"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThoughtProcess, IntermediateMessage, TaskSequence } from '@/types/intermediate-message';
import { Progress } from '@/components/ui/progress';

interface IntermediateMessageHandlerProps {
  streamingData?: any;
  onThoughtComplete?: (thought: ThoughtProcess) => void;
  onTaskComplete?: (task: TaskSequence) => void;
}

export function IntermediateMessageHandler({
  streamingData,
  onThoughtComplete,
  onTaskComplete
}: IntermediateMessageHandlerProps) {
  const [currentThought, setCurrentThought] = useState<ThoughtProcess | null>(null);
  const [taskSequence, setTaskSequence] = useState<TaskSequence | null>(null);

  useEffect(() => {
    if (!streamingData) return;

    try {
      const data = JSON.parse(streamingData);
      
      // Handle thought processes
      if (data.type === 'thinking') {
        setCurrentThought({
          type: data.thoughtType,
          content: data.content,
          step: data.step,
          totalSteps: data.totalSteps
        });
        
        if (data.status === 'complete' && onThoughtComplete) {
          onThoughtComplete({
            type: data.thoughtType,
            content: data.content,
            step: data.step,
            totalSteps: data.totalSteps
          });
        }
      }

      // Handle task sequences
      if (data.type === 'task_sequence') {
        setTaskSequence(prevSequence => ({
          id: data.sequenceId,
          tasks: data.tasks,
          currentTaskIndex: data.currentTaskIndex,
          progress: (data.currentTaskIndex / data.tasks.length) * 100
        }));

        if (data.status === 'complete' && onTaskComplete) {
          onTaskComplete({
            id: data.sequenceId,
            tasks: data.tasks,
            currentTaskIndex: data.currentTaskIndex,
            progress: 100
          });
        }
      }
    } catch (error) {
      console.error('Error parsing intermediate message:', error);
    }
  }, [streamingData, onThoughtComplete, onTaskComplete]);

  return (
    <AnimatePresence>
      {(currentThought || taskSequence) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg"
        >
          {currentThought && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {currentThought.type}...
                </span>
                {currentThought.step && currentThought.totalSteps && (
                  <span className="text-xs text-muted-foreground">
                    Step {currentThought.step} of {currentThought.totalSteps}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{currentThought.content}</p>
              {currentThought.step && currentThought.totalSteps && (
                <Progress 
                  value={(currentThought.step / currentThought.totalSteps) * 100} 
                  className="h-1"
                />
              )}
            </div>
          )}

          {taskSequence && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Task Progress</span>
                <span className="text-xs text-muted-foreground">
                  {taskSequence.currentTaskIndex + 1} of {taskSequence.tasks.length}
                </span>
              </div>
              <Progress value={taskSequence.progress} className="h-1" />
              <div className="space-y-2">
                {taskSequence.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`text-sm ${
                      index === taskSequence.currentTaskIndex
                        ? 'text-primary'
                        : index < taskSequence.currentTaskIndex
                        ? 'text-muted-foreground line-through'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {task.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 