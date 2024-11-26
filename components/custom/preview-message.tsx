import { Message } from "ai";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MessageActions } from "./message-actions";
import type { Vote } from "@/lib/supabase/types";
import type { UIBlock } from "@/types/chat";

interface PreviewMessageProps {
  message: Message;
  chatId: string;
  isLoading?: boolean;
  block?: UIBlock;
  setBlock?: (block: UIBlock) => void;
  vote?: Vote;
}

export function PreviewMessage({ 
  message, 
  chatId, 
  isLoading,
  block,
  setBlock,
  vote 
}: PreviewMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        isUser ? "justify-end" : "justify-start",
        isLoading && "opacity-50"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg px-4 py-2 max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {!isUser && (
          <MessageActions
            chatId={chatId}
            message={message}
            vote={vote}
            isLoading={isLoading || false}
          />
        )}
      </div>
    </motion.div>
  );
} 