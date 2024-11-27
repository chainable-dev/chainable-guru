import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { modelsService } from '@/lib/services/models.service';
import { Chat as PreviewChat } from "@/components/custom/chat";
import {
	getChatById,
	getMessagesByChatId,
	getSession,
} from "@/db/cached-queries";
import { convertToUIMessages } from "@/lib/utils";

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

	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get("model-id")?.value;
	const selectedModelId = modelIdFromCookie && modelsService.isValidModelId(modelIdFromCookie)
		? modelIdFromCookie
		: modelsService.getDefaultModel().id;

	return (
		<PreviewChat
			id={chat.id}
			initialMessages={convertToUIMessages(messagesFromDb)}
			selectedModelId={selectedModelId}
		/>
	);
}
