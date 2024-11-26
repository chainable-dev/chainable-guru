import { headers } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { ChatHistoryClient } from "./chat-history-client";

export async function ChatHistoryServer({ userId }: { userId: string }) {
  // This ensures this component is rendered on the server
  headers();
  
  const supabase = createClient();
  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return null;
  }

  return <ChatHistoryClient initialChats={chats || []} userId={userId} />;
} 