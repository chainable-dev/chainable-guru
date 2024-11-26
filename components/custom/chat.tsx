"use client";

import { useChat } from "ai/react";
import type { Message, CreateMessage, ChatRequestOptions } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { KeyboardIcon, WalletIcon } from "lucide-react";
import { useState, Suspense } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useWindowSize } from "usehooks-ts";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import type { 
  ChatProps, 
  FileUploadState, 
  AppendFunction, 
  AppendOptions 
} from "@/types/chat";
import type { Attachment, AIAttachment } from "@/types/attachments";
import { Block, UIBlock } from "@/components/custom/block";
import { BlockStreamHandler } from "@/components/custom/block-stream-handler";
import { ChatHeader } from "@/components/custom/chat-header";
import { MultimodalInput } from "@/components/custom/multimodal-input";
import { Overview } from "@/components/custom/overview";
import { PreviewMessage, ThinkingMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { Tooltip, BetterTooltip, TooltipTrigger } from "../ui/tooltip";

import { Database } from "@/lib/supabase/types";
import { fetcher } from "@/lib/utils";
import { useWalletState } from "@/hooks/useWalletState";
import { containerAnimationVariants } from "@/lib/animation-variants";
import { LoadingPage } from "./loading-page";

type Vote = Database["public"]["Tables"]["votes"]["Row"];

export function Chat({ id, initialMessages, selectedModelId }: ChatProps) {
  const { mutate } = useSWRConfig();
  const { width: windowWidth = 1920, height: windowHeight = 1080 } = useWindowSize();
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    progress: 0,
    uploading: false,
    error: null,
  });
  const [webSearchEnabled] = useState(true);
  const [block, setBlock] = useState<UIBlock>({
    documentId: "init",
    content: "",
    title: "",
    status: "idle",
    isVisible: false,
    boundingBox: {
      top: windowHeight / 4,
      left: windowWidth / 4,
      width: 250,
      height: 50,
    },
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append: rawAppend,
    isLoading,
    stop,
    data: streamingData,
  } = useChat({
    body: { id, modelId: selectedModelId },
    initialMessages,
    onFinish: () => {
      mutate("/api/history");
    },
  });

  const { data: votes, isLoading: isVotesLoading } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  if (isVotesLoading) {
    return <LoadingPage />;
  }

  const append = async (
    message: CreateMessage,
    options?: ChatRequestOptions
  ) => {
    const messageWithId = {
      id: crypto.randomUUID(),
      ...message,
    };
    
    const result = await rawAppend(messageWithId, {
      ...options,
      experimental_attachments: options?.experimental_attachments as AIAttachment[]
    });
    return result || null;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFileUpload({ progress: 0, uploading: true, error: null });

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          setFileUpload((prev) => ({ ...prev, progress }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast.success("File uploaded successfully");
          append({
            id: crypto.randomUUID(),
            role: "user",
            content: `[File uploaded: ${file.name}](${response.url})`,
          });
          resolve(response);
        } else {
          setFileUpload((prev) => ({
            ...prev,
            error: "Upload failed",
          }));
          toast.error("Failed to upload file");
          reject(new Error("Upload failed"));
        }
        setFileUpload((prev) => ({ ...prev, uploading: false }));
      });

      xhr.addEventListener("error", () => {
        setFileUpload((prev) => ({
          ...prev,
          error: "Upload failed",
          uploading: false,
        }));
        toast.error("Failed to upload file");
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  };

  return (
    <>
      <div className="flex flex-col min-w-0 h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <ChatHeader selectedModelId={selectedModelId} />
        <Suspense fallback={<LoadingPage />}>
          <motion.div
            ref={messagesContainerRef}
            className="flex flex-col min-w-0 gap-4 flex-1 overflow-y-auto p-4 bg-transparent"
            variants={containerAnimationVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {messages.length === 0 && <Overview />}

              {messages.map((message, index) => (
                <PreviewMessage
                  key={message.id}
                  chatId={id}
                  message={message}
                  block={block}
                  setBlock={setBlock}
                  isLoading={isLoading && messages.length - 1 === index}
                  vote={votes?.find((vote) => vote.message_id === message.id)}
                />
              ))}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
                <ThinkingMessage />
              )}
            </AnimatePresence>

            <motion.div 
              ref={messagesEndRef} 
              className="shrink-0 min-w-[24px] min-h-[24px]"
              layout
            />
          </motion.div>
        </Suspense>

        <motion.form
          layout
          id="chat-form"
          name="chat-form"
          className="flex mx-auto px-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg pb-4 md:pb-6 gap-2 w-full md:max-w-3xl border border-gray-200 dark:border-gray-700"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          aria-label="Chat input form"
        >
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            setMessages={setMessages}
            append={append}
            webSearchEnabled={webSearchEnabled}
          />
        </motion.form>
      </div>

      <AnimatePresence mode="wait">
        {block && block.isVisible && (
          <Block
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            block={block}
            setBlock={setBlock}
            messages={messages}
            setMessages={setMessages}
            votes={votes}
          />
        )}
      </AnimatePresence>

      <BlockStreamHandler streamingData={streamingData} setBlock={setBlock} />

      <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-colors duration-200"
              type="button"
              aria-label="Keyboard shortcuts"
            >
              <KeyboardIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <BetterTooltip content="⌘ / to focus input\n⌘ K to clear chat\nESC to stop generation">
            <div className="text-sm">
              <p>⌘ / to focus input</p>
              <p>⌘ K to clear chat</p>
              <p>ESC to stop generation</p>
            </div>
          </BetterTooltip>
        </Tooltip>
      </div>

      {fileUpload.uploading && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <Progress value={fileUpload.progress} className="w-full bg-indigo-100 dark:bg-gray-700" />
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 text-center">
            Uploading... {fileUpload.progress}%
          </p>
        </div>
      )}

      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
        id="file-upload"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </>
  );
}
