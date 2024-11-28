import { Chat } from "@/components/custom/chat";
import { getChat } from "@/app/(chat)/actions";
import { redirect } from "next/navigation";

export interface PageProps {
	params: {
		id: string;
	};
	searchParams: {
		model?: string;
	};
}

export default async function ChatPage({ params, searchParams = {} }: PageProps) {
	const chat = await getChat(params.id);
	
	if (!chat) {
		redirect("/");
	}

	return (
		<Chat
			id={params.id}
			initialMessages={chat.messages}
			selectedModelId={searchParams.model || "gpt-3.5-turbo"}
		/>
	);
}
