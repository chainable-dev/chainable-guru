import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
	getChatByIdQuery,
	getUserQuery,
	getChatsByUserIdQuery,
	getMessagesByChatIdQuery,
	getVotesByChatIdQuery,
	getDocumentByIdQuery,
	getDocumentsByIdQuery,
	getSuggestionsByDocumentIdQuery,
	getSessionQuery,
	getUserByIdQuery,
	getChatWithMessagesQuery,
} from "@/db/queries";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

const getSupabase = cache(() => createClient());

export const getSession = async () => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getSessionQuery(supabase as SupabaseClient<Database>);
		},
		["session"],
		{
			tags: [`session`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getUserById = async (id: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getUserByIdQuery(supabase as SupabaseClient<Database>, id);
		},
		[`user_by_id`, id.slice(2, 12)],
		{
			tags: [`user_by_id_${id.slice(2, 12)}`],

			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getUser = async (email: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getUserQuery(supabase as SupabaseClient<Database>, email);
		},
		["user", email],
		{
			tags: [`user_${email}`],
			revalidate: 3600, // Cache for 1 hour
		},
	)();
};

export const getChatById = async (chatId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getChatByIdQuery(supabase as SupabaseClient<Database>, { id: chatId });
		},
		["chat", chatId],
		{
			tags: [`chat_${chatId}`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getChatsByUserId = async (userId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getChatsByUserIdQuery(supabase as SupabaseClient<Database>, { id: userId });
		},
		["chats", userId],
		{
			tags: [`user_${userId}_chats`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getMessagesByChatId = async (chatId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getMessagesByChatIdQuery(supabase as SupabaseClient<Database>, { id: chatId });
		},
		["messages", chatId],
		{
			tags: [`chat_${chatId}_messages`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getVotesByChatId = async (chatId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getVotesByChatIdQuery(supabase as SupabaseClient<Database>, { id: chatId });
		},
		["votes", chatId],
		{
			tags: [`chat_${chatId}_votes`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getDocumentById = async (documentId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getDocumentByIdQuery(supabase as SupabaseClient<Database>, { id: documentId });
		},
		["document", documentId],
		{
			tags: [`document_${documentId}`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getDocumentsById = async (documentId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getDocumentsByIdQuery(supabase as SupabaseClient<Database>, { id: documentId });
		},
		["documents", documentId],
		{
			tags: [`document_${documentId}_versions`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getSuggestionsByDocumentId = async (documentId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getSuggestionsByDocumentIdQuery(supabase as SupabaseClient<Database>, {
				documentId: documentId,
			});
		},
		["suggestions", documentId],
		{
			tags: [`document_${documentId}_suggestions`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};

export const getChatWithMessages = async (chatId: string) => {
	const supabase = await getSupabase();

	return unstable_cache(
		async () => {
			return getChatWithMessagesQuery(supabase as SupabaseClient<Database>, { id: chatId });
		},
		["chat_with_messages", chatId],
		{
			tags: [`chat_${chatId}`, `chat_${chatId}_messages`],
			revalidate: 10, // Cache for 10 seconds
		},
	)();
};
