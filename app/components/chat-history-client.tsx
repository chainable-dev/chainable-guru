"use client";

import { useParams } from "next/navigation";
import { memo } from "react";
import useSWR from "swr";

import { useSidebar } from "@/components/ui/sidebar";
import { Chat } from "@/lib/supabase/types";
import { GroupedChatList } from "./chat-history-grouped-list";

export function ChatHistoryClient({
  initialChats,
  userId,
}: {
  initialChats: Chat[];
  userId: string;
}) {
  const { id } = useParams() as { id: string };
  const { setOpenMobile } = useSidebar();
  
  const { data: chats = initialChats } = useSWR(
    `/api/chats?userId=${userId}`,
    null,
    {
      fallbackData: initialChats,
      revalidateOnFocus: false
    }
  );

  return (
    <GroupedChatList
      chats={chats}
      userId={userId}
      selectedChatId={id}
      onChatClick={() => setOpenMobile(false)}
    />
  );
} 