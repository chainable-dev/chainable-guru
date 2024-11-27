import { cookies } from "next/headers";
import { modelsService } from '@/lib/services/models.service';
import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
	const id = generateUUID();

	const cookieStore = await cookies();
	const modelIdFromCookie = cookieStore.get("model-id")?.value;

	const selectedModelId = modelIdFromCookie && modelsService.isValidModelId(modelIdFromCookie)
		? modelIdFromCookie
		: modelsService.getDefaultModel().id;

	return (
		<Chat
			key={id}
			id={id}
			initialMessages={[]}
			selectedModelId={selectedModelId}
		/>
	);
}
