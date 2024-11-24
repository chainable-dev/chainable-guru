"use client";

import { ElementRef, useEffect, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";

interface ChatMessagesProps {
  messages: ChatMessageProps[];
  isLoading: boolean;
}

export const ChatMessages = ({
  messages = [],
  isLoading,
}: ChatMessagesProps) => {
  const scrollRef = useRef<ElementRef<"div">>(null);
  const bottomRef = useRef<ElementRef<"div">>(null);

  const { isAtBottom, scrollToBottom } = useChatScroll({
    chatRef: scrollRef,
    bottomRef: bottomRef,
    loadMore: () => {}, // Implement if needed
    shouldLoadMore: !isLoading && messages.length > 0,
  });

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, messages.length]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4">
      <div className="flex flex-col space-y-4 py-4">
        <Separator className="my-2" />
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            isLoading={isLoading}
          />
        ))}
        {isLoading && (
          <ChatMessage
            role="assistant"
            content="Thinking..."
            isLoading={true}
          />
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}; 