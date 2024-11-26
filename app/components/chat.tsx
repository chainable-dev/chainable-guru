"use client";

import { useChat } from "ai/react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";

import { ChatProps, Message } from "@/types/chat";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatScrollAnchor } from "./chat-scroll-anchor";
import { PreviewMessage } from "./preview-message";
import { IntermediateMessage } from "./intermediate-message";
import { Logger } from "@/lib/utils/logger";

export function Chat({ id, initialMessages = [], append: appendToChat }: ChatProps) {
  const { height } = useWindowSize();
  const [intermediateMessage, setIntermediateMessage] = useState<Message | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    setMessages,
  } = useChat({
    id,
    initialMessages,
    api: "/api/chat",
    onResponse: (response) => {
      if (response.status === 401) {
        toast.error(
          "You have reached your daily message limit. Please try again tomorrow."
        );
      }
    },
    onFinish: () => {
      setIntermediateMessage(null);
    },
    onError: (error) => {
      Logger.error("Chat error", error);
      toast.error("An error occurred. Please try again.");
      setIntermediateMessage(null);
    },
  });

  const appendMessage = async (message: Message) => {
    if (message.isIntermediate) {
      setIntermediateMessage(message);
      return null;
    }
    
    if (appendToChat) {
      return appendToChat(message);
    }

    return append(message);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <div
        className="flex-1 overflow-y-auto"
        style={{ height: height - 50 - 64 - 16 }}
      >
        <div className="max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                message={message}
                chatId={id}
                isLoading={isLoading && message === messages[messages.length - 1]}
              />
            ))}
            
            {intermediateMessage && (
              <IntermediateMessage
                key="intermediate"
                message={intermediateMessage}
              />
            )}
          </AnimatePresence>

          <ChatScrollAnchor trackVisibility={isLoading} />
        </div>
      </div>

      <div className="p-4 bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            appendMessage={appendMessage}
          />
        </div>
      </div>
    </div>
  );
} 