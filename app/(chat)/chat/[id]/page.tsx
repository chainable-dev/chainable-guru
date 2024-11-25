import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DEFAULT_MODEL_NAME, models } from "@/ai/models";
import { Chat as PreviewChat } from "@/components/custom/chat";
import {
	getChatById,
	getMessagesByChatId,
	getSession,
} from "@/db/cached-queries";
import { convertToUIMessages } from "@/utils/convert-to-ui-messages";
import { Message, Role } from "@/types/message";

export default async function Page(props: { params: Promise<any> }) {
	const params = await props.params;
	const { id } = params;
	const chat = await getChatById(id);

	if (!chat) {
		notFound();
	}

	const user = await getSession();

	if (!user) {
		return notFound();
	}

	if (user.id !== chat.user_id) {
		return notFound();
	}

	const messagesFromDb = await getMessagesByChatId(id);
	
	// Convert database messages to the correct type
	const typedMessages: Message[] = messagesFromDb.map(msg => ({
		...msg,
		role: msg.role as Role,
		content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
	}));

	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get("model-id")?.value;
	const selectedModelId =
		models.find((model) => model.id === modelIdFromCookie)?.id ||
		DEFAULT_MODEL_NAME;

	const uiMessages = convertToUIMessages(typedMessages);

	return (
		<PreviewChat
			id={chat.id}
			initialMessages={uiMessages}
			selectedModelId={selectedModelId}
		/>
	);
}
