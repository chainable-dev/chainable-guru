"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { ErrorBoundary } from "react-error-boundary";
import { Message } from "@/lib/types";

interface ChatProps {
  initialMessages?: Message[];
  onError?: (error: Error) => void;
}

function ChatFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) {
  return (
    <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
      <h2 className="text-red-800 dark:text-red-200 font-semibold">Chat Error</h2>
      <p className="text-red-700 dark:text-red-300 text-sm">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 text-red-900 dark:text-red-100 rounded"
      >
        Try Again
      </button>
    </div>
  );
}

function ChatComponent({ initialMessages = [], onError }: ChatProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { messages, append, reload, isLoading } = useChat({
    initialMessages,
    onError: (error) => {
      console.error("Chat error:", error);
      onError?.(error);
    },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Chat(props: ChatProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ChatFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        window.location.reload();
      }}
    >
      <ChatComponent {...props} />
    </ErrorBoundary>
  );
}
