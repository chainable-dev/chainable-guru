import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DEFAULT_MODEL_NAME, models } from "@/ai/models";
import { Chat } from "@/components/custom/chat";
import {
	getChatById,
	getMessagesByChatId,
	getSession,
} from "@/db/cached-queries";
import { convertToUIMessages } from "@/utils/convert-to-ui-messages";
import { DatabaseMessage } from "@/types/message";

export default async function Page({ params }: { params: { id: string } }) {
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

	const messagesFromDb = (await getMessagesByChatId(id)) as DatabaseMessage[];

	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get("model-id")?.value;
	const selectedModelId =
		models.find((model) => model.id === modelIdFromCookie)?.id ||
		DEFAULT_MODEL_NAME;

	const uiMessages = convertToUIMessages(messagesFromDb);

	return (
		<Chat
			id={chat.id}
			initialMessages={uiMessages}
			selectedModelId={selectedModelId}
		/>
	);
}
