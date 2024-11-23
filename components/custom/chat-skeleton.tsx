'use client'

import { motion } from 'framer-motion'

export function ChatSkeleton() {
  return (
    <motion.div
      className="flex gap-3 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      
      {/* Message content */}
      <div className="flex-1 space-y-2.5">
        {/* Message header */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
        </div>
        
        {/* Message body with typing effect */}
        <div className="space-y-2">
          <motion.div 
            className="h-4 bg-muted rounded"
            initial={{ width: "20%" }}
            animate={{ width: "80%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="h-4 bg-muted rounded"
            initial={{ width: "30%" }}
            animate={{ width: "60%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.2
            }}
          />
          <motion.div 
            className="h-4 bg-muted rounded"
            initial={{ width: "40%" }}
            animate={{ width: "70%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 0.4
            }}
          />
        </div>
      </div>
    </motion.div>
  )
} 