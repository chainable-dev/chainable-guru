import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThinkingMessage() {
  return (
    <div className={cn(
      "group relative flex items-start md:gap-6 gap-4 px-4 mt-4"
    )}>
      <div className="flex-1 max-w-3xl space-y-4 overflow-hidden">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm">AI is thinking...</p>
        </div>
      </div>
    </div>
  );
} 