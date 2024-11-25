import { motion } from "framer-motion";

export function ThinkingMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4"
    >
      <div className="flex space-x-1.5">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-bounce" />
      </div>
      <span className="text-sm text-muted-foreground">Thinking...</span>
    </motion.div>
  );
} 