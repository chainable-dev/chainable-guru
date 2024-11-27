import { useTaskManager } from "@/hooks/useTaskManager";
import { TaskList } from "@/components/custom/task-list";

export function Chat({
	id,
	initialMessages,
	selectedModelId,
}: {
	id: string;
	initialMessages: Array<Message>;
	selectedModelId: string;
}) {
	// ... existing code ...

	const { tasks, createTask } = useTaskManager();

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(event.currentTarget);
			const message = formData.get("message") as string;

			// Create a new task for the message
			const { taskId } = createTask(message, "chat", 1);

			// Add user message to the chat
			append({
				role: "user",
				content: message,
				id: taskId,
			});

			setInput("");
		} catch (error) {
			console.error("Error submitting message:", error);
			toast.error("Failed to send message");
		} finally {
			setIsLoading(false);
		}
	};

	const handleTaskClick = (task: Task) => {
		if (task.status === "completed" && task.output) {
			append({
				role: "assistant",
				content: task.output,
				id: task.id,
			});
		}
	};

	return (
		<>
			<div className="flex flex-col min-w-0 h-dvh bg-background">
				{/* ... existing JSX ... */}
			</div>

			<TaskList tasks={tasks} onTaskClick={handleTaskClick} />

			{/* ... existing JSX ... */}
		</>
	);
}

// ... existing code ... 