"use server";

import { CoreMessage, CoreUserMessage, generateText } from "ai";
import { cookies } from "next/headers";

import { customModel } from "@/ai";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/db/cached-queries";

export async function saveModelId(model: string) {
	const cookieStore = await cookies();
	cookieStore.set("model-id", model);
}

export async function generateTitleFromUserMessage({
	message,
}: {
	message: CoreUserMessage;
}) {
	const { text: title } = await generateText({
		model: customModel("gpt-4o-mini"),
		system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
		prompt: JSON.stringify(message),
	});

	return title;
}

export async function getChat(id: string) {
  try {
    const user = await getSession();
    if (!user) return null;

    const supabase = await createClient();
    
    // Get chat
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
      
    if (chatError || !chat) return null;

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) return null;

    return {
      ...chat,
      messages: messages || []
    };
  } catch (error) {
    console.error('Error getting chat:', error);
    return null;
  }
}

export async function createChat() {
  try {
    const user = await getSession();
    if (!user) return null;

    const supabase = await createClient();
    
    const { data: chat, error } = await supabase
      .from('chats')
      .insert([
        { 
          user_id: user.id,
          title: 'New Chat'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return chat;
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
}

export async function updateChatTitle(id: string, title: string) {
  try {
    const user = await getSession();
    if (!user) return false;

    const supabase = await createClient();
    
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', id)
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Error updating chat title:', error);
    return false;
  }
}
