'use client';

import { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { createClient } from '@/lib/supabase/client';
import { sanitizeUIMessages } from '@/lib/utils';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

import type { Attachment as SupabaseAttachment } from '@/types/supabase';

const suggestedActions = [
  {
    title: 'What is the weather',
    label: 'in San Francisco?',
    action: 'What is the weather in San Francisco?',
  },
  {
    title: 'Help me draft an essay',
    label: 'about Silicon Valley',
    action: 'Help me draft a short essay about Silicon Valley',
  },
];

// Add type for temp attachments
type TempAttachment = {
  url: string;
  name: string;
  contentType: string;
  path?: string;
};

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const params = useParams();
  const chatId = params?.id as string;
  const supabase = createClient();
  
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    ''
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const submitForm = useCallback(() => {
    if (chatId) {
      // Normal flow with database
      handleSubmit(undefined, {
        experimental_attachments: attachments,
      });
    } else {
      // Create new chat with temp attachments
      createNewChat({
        message: input,
        attachments: attachments,
      });
    }

    setAttachments([]);
    setLocalStorageInput('');
  }, [chatId, attachments, input]);

  const createNewChat = async ({
    message,
    attachments
  }: {
    message: string,
    attachments: Array<Attachment | TempAttachment>
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = session?.user?.id;

      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          attachments,
          sessionId
        })
      });

      if (response.ok) {
        const { chatId } = await response.json();
        window.history.pushState({}, '', `/chat/${chatId}`);
      }
    } catch (error) {
      toast.error('Failed to create chat');
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        return {
          name: file.name,
          url: data.url,
          contentType: file.type,
          path: data.path
        };
      } else {
        const { error } = await response.json();
        throw new Error(error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload file');
      throw error;
    }
  };

  const saveFilePathToDatabase = async (chatId: string, filePath: string) => {
    try {
      const response = await fetch(`/api/files/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, filePath }),
      });

      if (!response.ok) {
        throw new Error('Failed to save file path to database');
      }
    } catch (error) {
      console.error('Error saving file path:', error);
      toast.error('Failed to save file path to database');
    }
  };

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    if (!chatId) {
      toast.error('Please start a chat before uploading files');
      return;
    }

    const files = Array.from(event.target.files || []);
    setUploadQueue(files.map(file => file.name));

    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      
      const successfulAttachments = uploadedAttachments.filter((attachment): attachment is NonNullable<typeof attachment> => 
        attachment !== undefined && attachment.contentType !== undefined
      );

      setAttachments(current => [...current, ...successfulAttachments]);
      
      if (successfulAttachments.length > 0) {
        toast.success('Files uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload one or more files');
    } finally {
      setUploadQueue([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset file input
      }
    }
  }, [chatId, setAttachments]);

  const removeAttachment = (url: string) => {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.url !== url)
    );
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="grid sm:grid-cols-2 gap-2 w-full">
            {suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? 'hidden sm:block' : 'block'}
              >
                <Button
                  variant="ghost"
                  onClick={async () => {
                    window.history.replaceState({}, '', `/chat/${chatId}`);

                    append({
                      role: 'user',
                      content: suggestedAction.action,
                    });
                  }}
                  className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-muted-foreground">
                    {suggestedAction.label}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div className="flex flex-row gap-4 overflow-x-auto pb-2">
          {attachments.map((attachment) => (
            <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
              onRemove={removeAttachment}
            />
          ))}
          
          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl text-base bg-muted',
          className
        )}
        rows={3}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();

            if (isLoading) {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      {isLoading ? (
        <Button
          className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 border dark:border-zinc-600"
          onClick={(event) => {
            event.preventDefault();
            stop();
            setMessages((messages) => sanitizeUIMessages(messages));
          }}
        >
          <StopIcon size={14} />
        </Button>
      ) : (
        <Button
          className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 border dark:border-zinc-600"
          onClick={(event) => {
            event.preventDefault();
            submitForm();
          }}
          disabled={input.length === 0 || uploadQueue.length > 0}
        >
          <ArrowUpIcon size={14} />
        </Button>
      )}

      <Button
        className="rounded-full p-1.5 h-fit absolute bottom-2 right-11 m-0.5 dark:border-zinc-700"
        onClick={(event) => {
          event.preventDefault();
          fileInputRef.current?.click();
        }}
        variant="outline"
        disabled={isLoading}
      >
        <PaperclipIcon size={14} />
      </Button>
    </div>
  );
}
