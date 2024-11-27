import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface ChatHistoryProps {
	items: {
		id: string;
		title: string;
		timestamp: string;
	}[];
	activeId?: string;
	onSelect: (id: string) => void;
	onNewChat: () => void;
}

export function ChatHistory({ items, activeId, onSelect, onNewChat }: ChatHistoryProps) {
	const groupedItems = items.reduce((acc, item) => {
		const date = new Date(item.timestamp);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		let group = "Older";
		if (date.toDateString() === today.toDateString()) {
			group = "Today";
		} else if (date.toDateString() === yesterday.toDateString()) {
			group = "Yesterday";
		} else if (date > new Date(today.setDate(today.getDate() - 7))) {
			group = "Last 7 days";
		}

		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push(item);
		return acc;
	}, {} as Record<string, typeof items>);

	return (
		<div className="fixed top-0 left-0 z-30 h-full w-80 border-r border-[#2d2d3a] bg-[#1f1f28]">
			<div className="flex h-14 items-center justify-between border-b border-[#2d2d3a] px-4">
				<h2 className="text-lg font-semibold text-gray-100">Chatbot</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={onNewChat}
					className="h-8 w-8 text-gray-400 hover:text-gray-100"
				>
					<PlusCircle className="h-5 w-5" />
					<span className="sr-only">New Chat</span>
				</Button>
			</div>
			<ScrollArea className="h-[calc(100vh-3.5rem)]">
				{Object.entries(groupedItems).map(([group, groupItems]) => (
					<div key={group} className="py-2">
						<h3 className="mb-1 px-4 text-sm font-medium text-gray-400">
							{group}
						</h3>
						{groupItems.map((item) => (
							<button
								key={item.id}
								onClick={() => onSelect(item.id)}
								className={`flex w-full items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-[#2d2d3a] ${
									activeId === item.id ? "bg-[#2d2d3a]" : ""
								}`}
							>
								<span className="truncate">{item.title}</span>
								<span className="ml-2 rounded bg-[#2d2d3a] px-2 py-1 text-xs text-gray-400 hover:bg-[#4f4f5f]">
									More
								</span>
							</button>
						))}
					</div>
				))}
			</ScrollArea>
		</div>
	);
}
