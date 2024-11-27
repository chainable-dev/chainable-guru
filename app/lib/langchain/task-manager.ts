import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { Observable } from "rxjs";

export interface Task {
  id: string;
  type: "chat" | "analysis" | "research";
  priority: number;
  status: "pending" | "running" | "completed" | "failed";
  input: string;
  output?: string;
  error?: string;
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

export class TaskManager {
  private tasks: Map<string, Task>;
  private chatModel: ChatOpenAI;
  private maxConcurrentTasks: number;
  private runningTasks: Set<string>;

  constructor(apiKey: string, maxConcurrentTasks = 3) {
    this.tasks = new Map();
    this.runningTasks = new Set();
    this.maxConcurrentTasks = maxConcurrentTasks;
    
    this.chatModel = new ChatOpenAI({
      openAIApiKey: apiKey,
      streaming: true,
      modelName: "gpt-4-turbo-preview",
      maxTokens: 2000,
      temperature: 0.7,
    });
  }

  public addTask(task: Omit<Task, "status" | "progress">): string {
    const newTask: Task = {
      ...task,
      status: "pending",
      progress: 0,
    };
    this.tasks.set(task.id, newTask);
    this.processNextTasks();
    return task.id;
  }

  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  public getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getTaskStream(taskId: string): Observable<Task> {
    return new Observable((subscriber) => {
      const task = this.tasks.get(taskId);
      if (!task) {
        subscriber.error(new Error("Task not found"));
        return;
      }

      const checkTask = setInterval(() => {
        const currentTask = this.tasks.get(taskId);
        if (currentTask) {
          subscriber.next(currentTask);
          if (currentTask.status === "completed" || currentTask.status === "failed") {
            clearInterval(checkTask);
            subscriber.complete();
          }
        }
      }, 100);

      return () => {
        clearInterval(checkTask);
      };
    });
  }

  private async processNextTasks() {
    if (this.runningTasks.size >= this.maxConcurrentTasks) {
      return;
    }

    const pendingTasks = Array.from(this.tasks.values())
      .filter((task) => task.status === "pending")
      .sort((a, b) => b.priority - a.priority);

    for (const task of pendingTasks) {
      if (this.runningTasks.size >= this.maxConcurrentTasks) {
        break;
      }

      this.runningTasks.add(task.id);
      this.executeTask(task);
    }
  }

  private async executeTask(task: Task) {
    try {
      const updatedTask = { ...task, status: "running", startTime: new Date() };
      this.tasks.set(task.id, updatedTask);

      const chain = this.createChainForTask(task);
      const response = await chain.invoke({
        input: task.input,
        onProgress: (progress: number) => {
          const currentTask = this.tasks.get(task.id);
          if (currentTask) {
            this.tasks.set(task.id, { ...currentTask, progress });
          }
        },
      });

      this.tasks.set(task.id, {
        ...updatedTask,
        status: "completed",
        output: response,
        progress: 100,
        endTime: new Date(),
      });
    } catch (error) {
      this.tasks.set(task.id, {
        ...task,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        progress: 0,
        endTime: new Date(),
      });
    } finally {
      this.runningTasks.delete(task.id);
      this.processNextTasks();
    }
  }

  private createChainForTask(task: Task): RunnableSequence {
    const basePrompt = PromptTemplate.fromTemplate(`
      Task Type: {type}
      Input: {input}
      
      Please process this task and provide a detailed response.
      If this is a research task, include citations and sources.
      If this is an analysis task, provide step-by-step reasoning.
      
      Response:
    `);

    const chain = RunnableSequence.from([
      {
        type: () => task.type,
        input: (input: string) => input,
      },
      basePrompt,
      this.chatModel,
      new StringOutputParser(),
    ]);

    return chain;
  }
} 