"use server";

import { CoreUserMessage } from "ai";
import { cookies } from "next/headers";
import { chatService } from '@/lib/services/chat.service';
import { modelsService } from '@/lib/services/models.service';

export async function saveModelId(model: string) {
	const cookieStore = await cookies();
	cookieStore.set("model-id", model);
}

export async function generateTitleFromUserMessage({
	message,
}: {
	message: CoreUserMessage;
}) {
	return chatService.generateTitle(message);
}
