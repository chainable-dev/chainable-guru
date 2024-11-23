'use client';

import { useParams } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { ChatService } from '@/lib/services/chat-service';
import { useSidebar } from '@/components/ui/sidebar';
import { Chat } from '@/lib/supabase/types';
import { GroupedChatList } from './chat-history-grouped-list';

export function ChatHistoryClient({
  initialChats,
  userId,
}: {
  initialChats: Chat[];
  userId: string;
}) {
  const { id } = useParams();
  const { setOpenMobile } = useSidebar();
  const [chatService, setChatService] = useState<ChatService | null>(null);

  useEffect(() => {
    setChatService(ChatService.getInstance());
  }, []);

  const fetchChats = useCallback(async () => {
    if (!chatService) return initialChats;
    return chatService.getChats(userId);
  }, [chatService, userId, initialChats]);

  const { data: chats } = useSWR<Chat[]>(
    chatService ? ['chats', userId] : null,
    fetchChats,
    {
      fallbackData: initialChats,
      revalidateOnFocus: false,
    }
  );

  if (!chats?.length) {
    return (
      <div className="text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
        <div>Your conversations will appear here once you start chatting!</div>
      </div>
    );
  }

  return (
    <ChatList
      chats={chats}
      currentChatId={id as string}
      setOpenMobile={setOpenMobile}
    />
  );
}

const ChatList = memo(function ChatList({
  chats,
  currentChatId,
  setOpenMobile,
}: {
  chats: Chat[];
  currentChatId: string;
  setOpenMobile: (open: boolean) => void;
}) {
  return (
    <GroupedChatList
      chats={chats}
      currentChatId={currentChatId}
      setOpenMobile={setOpenMobile}
    />
  );
});
