"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ChatHistoryList } from "./chat-history-list";

interface ChatHistoryProps {
  userId: string;
}

async function fetchChats(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export function ChatHistory({ userId }: ChatHistoryProps) {
  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats", userId],
    queryFn: () => fetchChats(userId),
  });

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel("chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chats",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalidate and refetch
          void fetchChats(userId);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <ChatHistoryList chats={chats} />;
} 