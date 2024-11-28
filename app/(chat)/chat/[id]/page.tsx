import { Chat } from "@/components/custom/chat";
import { getChat } from "@/app/(chat)/actions";
import { redirect } from "next/navigation";

export default async function ChatPage({ params, searchParams }) {
	const chat = await getChat(params.id);
	
	if (!chat) {
		redirect("/");
	}

	const modelId = typeof searchParams.model === 'string' 
		? searchParams.model 
		: "gpt-3.5-turbo";

	return (
		<Chat
			id={params.id}
			initialMessages={chat.messages}
			selectedModelId={modelId}
		/>
	);
}
