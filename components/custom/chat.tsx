"use client";

import { useChat } from "ai/react";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { ChatScrollAnchor } from "./chat-scroll-anchor";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export interface ChatProps {
  id?: string;
  initialMessages?: any[];
  selectedModelId: string;
}

export function Chat({ id, initialMessages, selectedModelId }: ChatProps) {
  const { userId } = useAuth();
  const [messages, setMessages] = useState(initialMessages || []);

  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    id,
    body: {
      id,
      modelId: selectedModelId
    },
    initialMessages,
    onResponse(response) {
      if (response.status === 401) {
        toast.error("Please sign in to continue");
      }
    },
    onFinish(message) {
      setMessages(prev => [...prev, message]);
    }
  });

  useEffect(() => {
    setMessages(initialMessages || []);
  }, [initialMessages]);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader selectedModelId={selectedModelId} />
      <div className="flex-1 overflow-y-auto">
        <ChatMessages 
          messages={messages}
          isLoading={isLoading}
          userId={userId}
        />
        <ChatScrollAnchor trackVisibility={isLoading} />
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
