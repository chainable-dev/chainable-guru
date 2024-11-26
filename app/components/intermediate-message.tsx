import { motion } from 'framer-motion'
import { Message } from '@/types/chat'
import { cn } from '@/lib/utils'

interface IntermediateMessageProps {
  message: Message
}

export function IntermediateMessage({ message }: IntermediateMessageProps) {
  return (
    <motion.div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        "justify-start opacity-70"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.7, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col gap-2 rounded-lg px-4 py-2 max-w-[80%] bg-muted">
        <div className="flex items-center gap-2">
          {message.status === 'thinking' && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            </div>
          )}
          {message.status === 'processing' && (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  )
} 