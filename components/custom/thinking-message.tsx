import { motion } from "framer-motion";

export function ThinkingMessage() {
  return (
    <motion.div
      className="flex w-full items-start gap-4 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col rounded-lg px-4 py-2 max-w-[80%] bg-muted">
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-150" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-300" />
        </div>
      </div>
    </motion.div>
  );
} 