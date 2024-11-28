import { Chat } from "@/components/custom/chat";
import { getChat } from "@/app/(chat)/actions";
import { redirect } from "next/navigation";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
	searchParams: {
		model?: string;
	};
}

export default async function ChatPage({ params, searchParams = {} }: PageProps) {
	const resolvedParams = await params;
	const chat = await getChat(resolvedParams.id);
	
	if (!chat) {
		redirect("/");
	}

	return (
		<Chat
			id={resolvedParams.id}
			initialMessages={chat.messages}
			selectedModelId={searchParams.model || "gpt-3.5-turbo"}
		/>
	);
}
