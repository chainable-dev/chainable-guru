"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { memo } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}

interface ChatHistoryListProps {
  chats: Chat[];
}

export const ChatHistoryList = memo(function ChatHistoryList({ chats }: ChatHistoryListProps) {
  const { id: selectedChatId } = useParams() as { id?: string };

  const groupedChats = chats.reduce(
    (groups, chat) => {
      const date = new Date(chat.created_at);
      if (isToday(date)) {
        groups.today.push(chat);
      } else if (isYesterday(date)) {
        groups.yesterday.push(chat);
      } else if (date > subWeeks(new Date(), 1)) {
        groups.lastWeek.push(chat);
      } else if (date > subMonths(new Date(), 1)) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }
      return groups;
    },
    {
      today: [] as Chat[],
      yesterday: [] as Chat[],
      lastWeek: [] as Chat[],
      lastMonth: [] as Chat[],
      older: [] as Chat[],
    } as GroupedChats
  );

  const handleDeleteChat = async (chatId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("chats").delete().eq("id", chatId);
      if (error) throw error;
      toast.success("Chat deleted");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const renderChatGroup = (title: string, chats: Chat[]) => {
    if (!chats.length) return null;

    return (
      <SidebarGroup key={title}>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">{title}</div>
        <SidebarGroupContent>
          <SidebarMenu>
            {chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <Link
                  href={`/chat/${chat.id}`}
                  className={`rounded-md h-8 flex gap-2 px-2 items-center hover:bg-sidebar-accent/50 ${
                    selectedChatId === chat.id ? "bg-sidebar-accent" : ""
                  }`}
                >
                  <span className="flex-1 truncate text-sm">{chat.title || "New Chat"}</span>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <>
      {renderChatGroup("Today", groupedChats.today)}
      {renderChatGroup("Yesterday", groupedChats.yesterday)}
      {renderChatGroup("Last 7 Days", groupedChats.lastWeek)}
      {renderChatGroup("Last 30 Days", groupedChats.lastMonth)}
      {renderChatGroup("Older", groupedChats.older)}
    </>
  );
}); 