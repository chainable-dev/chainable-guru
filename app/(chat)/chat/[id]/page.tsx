import { Chat } from "@/components/custom/chat";
import { getChat } from "@/app/(chat)/actions";
import { redirect } from "next/navigation";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		model?: string;
	}>;
}

export default async function ChatPage({ params, searchParams }: PageProps) {
	const [resolvedParams, resolvedSearchParams] = await Promise.all([
		params,
		searchParams
	]);
	
	const chat = await getChat(resolvedParams.id);
	
	if (!chat) {
		redirect("/");
	}

	return (
		<Chat
			id={resolvedParams.id}
			initialMessages={chat.messages}
			selectedModelId={resolvedSearchParams.model || "gpt-3.5-turbo"}
		/>
	);
}
