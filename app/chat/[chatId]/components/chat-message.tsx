"use client";

import { useTheme } from "next-themes";
import { BeatLoader } from "react-spinners";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export interface ChatMessageProps {
  role: "user" | "assistant";
  content?: string;
  isLoading?: boolean;
}

export const ChatMessage = ({
  role,
  content,
  isLoading,
}: ChatMessageProps) => {
  const { theme } = useTheme();
  const { toast } = useToast();

  const onCopy = () => {
    if (!content) return;

    navigator.clipboard.writeText(content);
    toast({
      description: "Message copied to clipboard",
      duration: 3000,
    });
  };

  return (
    <div className={cn(
      "group flex items-start gap-x-3 py-4 w-full",
      role === "user" && "justify-end"
    )}>
      <div className={cn(
        "rounded-md px-4 py-2 max-w-sm text-sm",
        role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
        isLoading && "opacity-50"
      )}>
        {isLoading ? (
          <BeatLoader
            size={5}
            color={theme === "light" ? "black" : "white"}
          />
        ) : (
          <p className="text-sm">{content}</p>
        )}
      </div>
      {role !== "user" && content && !isLoading && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onCopy}
                className="opacity-0 group-hover:opacity-100 transition"
                size="icon"
                variant="ghost"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}; 