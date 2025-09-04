"use client";

import { useParams } from "next/navigation";
import { memo } from "react";
import useSWR from "swr";

import { useSidebar } from "@/components/ui/sidebar";
import { Chat } from "@/lib/supabase/types";
import { LoadingChatList } from "@/components/ui/loading";
import { Retry } from "@/components/ui/retry";

import { GroupedChatList } from "./chat-history-grouped-list";

export function ChatHistoryClient({
	initialChats,
	userId,
}: {
	initialChats: Chat[];
	userId: string;
}) {
	const { id } = useParams();
	const { setOpenMobile } = useSidebar();

	// Use SWR with initial data from server
	const { data: chats, isLoading, error, mutate } = useSWR<Chat[]>(["chats", userId], null, {
		fallbackData: initialChats,
		revalidateOnFocus: false,
	});

	// Show loading state when refreshing
	if (isLoading && !chats?.length) {
		return <LoadingChatList count={5} className="p-2" />;
	}

	// Show error state with retry
	if (error) {
		return (
			<Retry 
				onRetry={() => void mutate()}
				error="Failed to load chat history"
				className="p-2"
			/>
		);
	}

	if (!chats?.length) {
		return (
			<div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2 p-2">
				<div>Your conversations will appear here once you start chatting!</div>
			</div>
		);
	}

	return (
		<ChatList
			chats={chats}
			currentChatId={id as string}
			setOpenMobile={setOpenMobile}
		/>
	);
}

// Memoized chat list component
const ChatList = memo(function ChatList({
	chats,
	currentChatId,
	setOpenMobile,
}: {
	chats: Chat[];
	currentChatId: string;
	setOpenMobile: (open: boolean) => void;
}) {
	return (
		<GroupedChatList
			chats={chats}
			currentChatId={currentChatId}
			setOpenMobile={setOpenMobile}
		/>
	);
});
