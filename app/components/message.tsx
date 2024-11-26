"use client";

import { cn } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MessageProps, VoteType, ChatMessage } from "@/types/message";

export function Message({ 
  message, 
  chatId, 
  isLoading,
  vote 
}: MessageProps) {
  const [isVoting, setIsVoting] = useState(false);
  const isUser = message.role === "user";

  const handleVote = async (type: VoteType) => {
    if (!chatId || isVoting) return;
    setIsVoting(true);
    try {
      const response = await fetch("/api/chat/vote", {
        method: "POST",
        body: JSON.stringify({ chatId, messageId: message.id, type }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      toast.success("Vote recorded");
    } catch (error) {
      Logger.error("Failed to vote", error);
      toast.error("Failed to record vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn("flex gap-3 p-4", isUser ? "bg-background" : "bg-muted")}>
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          {message.content}
        </div>
      </div>
      {!isUser && !isLoading && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("up")}
            className={cn(
              "p-1 rounded-md hover:bg-muted",
              vote === "up" && "text-green-500"
            )}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleVote("down")}
            className={cn(
              "p-1 rounded-md hover:bg-muted",
              vote === "down" && "text-red-500"
            )}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function PreviewMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 p-4", isUser ? "bg-background" : "bg-muted")}>
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function ThinkingMessage() {
  return (
    <div className="flex gap-3 p-4 bg-muted">
      <div className="flex-1">
        <div className="prose dark:prose-invert max-w-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
} 