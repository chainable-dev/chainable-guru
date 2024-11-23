import { motion } from "framer-motion";
import { LoadingSkeleton } from "./loading-skeleton";

export function LoadingPage() {
  return (
    <motion.div 
      className="flex flex-col min-w-0 h-dvh bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Skeleton */}
      <div className="border-b p-4">
        <LoadingSkeleton className="h-8 w-48" />
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Message Skeletons */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <LoadingSkeleton className="size-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <LoadingSkeleton className="h-4 w-3/4" />
                <LoadingSkeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Input Area Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <LoadingSkeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
        <div className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.3s]" />
        <div className="size-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.15s]" />
        <div className="size-2 rounded-full bg-foreground/50 animate-bounce" />
      </div>
    </motion.div>
  );
} 