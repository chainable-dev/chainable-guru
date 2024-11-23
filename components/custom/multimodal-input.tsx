'use client';

import cx from 'classnames';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
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

import { useWalletState } from '@/hooks/useWalletState';
import { createClient } from '@/lib/supabase/client';
import { sanitizeUIMessages } from '@/lib/utils';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ChatSkeleton } from './chat-skeleton'

import type { Attachment as SupabaseAttachment } from '@/types/supabase';
import type { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai';

const suggestedActions = [
  {
    title: 'Create a new document',
    label: 'with the title "My New Document"',
    action: 'Create a new document with the title "My New Document"',
  },
  {
    title: 'Update an existing document',
    label: 'with the description "Add more details"',
    action: 'Update the document with ID "123" with the description "Add more details"',
  },
  {
    title: 'Request suggestions for a document',
    label: 'with ID "123"',
    action: 'Request suggestions for the document with ID "123"',
  },
  {
    title: 'Get the current weather',
    label: 'in San Francisco',
    action: 'Get the current weather in San Francisco',
  },
  {
    title: 'Check wallet balance',
    label: 'for my connected wallet',
    action: 'Check the balance of my connected wallet',
  },
  {
    title: 'Check wallet state',
    label: 'for my connected wallet',
    action: 'Check the state of my connected wallet',
  },
];
// Add type for temp attachments
type TempAttachment = {
  url: string;
  name: string;
  contentType: string;
  path?: string;
};

// Add type for staged files
interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: 'staging' | 'uploading' | 'complete' | 'error';
}

interface MultimodalInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  append: (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
  handleSubmit: (event?: { preventDefault?: () => void }, chatRequestOptions?: ChatRequestOptions) => void;
  className?: string;
  chatId: string;
}

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
  chatId
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const supabase = createClient();
  const {
    address,
    isConnected,
    chainId,
    networkInfo,
    isCorrectNetwork
  } = useWalletState();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [expectingText, setExpectingText] = useState(false);
  const stagedFileNames = useRef<Set<string>>(new Set());

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

  // Create blob URLs for file previews
  const createStagedFile = useCallback((file: File): StagedFile => {
    return {
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'staging'
    };
  }, []);

  // Clean up blob URLs when files are removed
  const removeStagedFile = useCallback((fileId: string) => {
    setStagedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.previewUrl);
      }
      const updatedFiles = prev.filter(f => f.id !== fileId);
      if (file) {
        stagedFileNames.current.delete(file.file.name);
      }
      return updatedFiles;
    });
  }, []);

  // Clean up all blob URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [stagedFiles]);

  const submitForm = useCallback(async () => {
    if (!input && attachments.length === 0) return;

    const isWalletQuery = input.toLowerCase().includes('wallet') ||
                         input.toLowerCase().includes('balance');

    // Set expecting text based on input type
    setExpectingText(true);

    if (isWalletQuery) {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return;
      }
      if (!isCorrectNetwork) {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
        return;
      }
    }

    const messageContent = isWalletQuery ? {
      text: input,
      attachments: attachments.map(att => ({
        url: att.url,
        name: att.name,
        type: att.contentType,
      })),
      walletAddress: address,
      chainId,
      network: networkInfo?.name,
      isWalletConnected: isConnected,
      isCorrectNetwork
    } : {
      text: input,
      attachments: attachments.map(att => ({
        url: att.url,
        name: att.name,
        type: att.contentType,
      }))
    };

    try {
      await append({
        role: 'user',
        content: JSON.stringify(messageContent),
      }, {
        experimental_attachments: attachments,
      });

      setInput('');
      setAttachments([]);
      setLocalStorageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      // Reset expectingText when response is received
      setExpectingText(false);
    }
  }, [
    input,
    attachments,
    append,
    setInput,
    setLocalStorageInput,
    address,
    chainId,
    setAttachments,
    isConnected,
    isCorrectNetwork,
    networkInfo
  ]);

  const handleSuggestedAction = useCallback((action: string) => {
    const isWalletAction = action.toLowerCase().includes('wallet') ||
                          action.toLowerCase().includes('balance');

    if (isWalletAction) {
      if (!isConnected) {
        toast.error('Please connect your wallet first');
        return;
      }
      if (!isCorrectNetwork) {
        toast.error('Please switch to Base Mainnet or Base Sepolia');
        return;
      }
    }

    setInput(action);
    submitForm();
  }, [isConnected, isCorrectNetwork, setInput, submitForm]);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Create staged files with blob URLs
    const newStagedFiles = files
      .filter(file => !stagedFileNames.current.has(file.name))
      .map(file => {
        stagedFileNames.current.add(file.name);
        return createStagedFile(file);
      });
    setStagedFiles(prev => [...prev, ...newStagedFiles]);

    try {
      // Upload each file
      for (const stagedFile of newStagedFiles) {
        setStagedFiles(prev =>
          prev.map(f => f.id === stagedFile.id ? { ...f, status: 'uploading' } : f)
        );

        const formData = new FormData();
        formData.append('file', stagedFile.file);
        formData.append('chatId', chatId);

        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();

        // Add to attachments on successful upload
        setAttachments(current => [...current, {
          url: data.url,
          name: stagedFile.file.name,
          contentType: stagedFile.file.type,
          path: data.path
        }]);

        // Mark as complete and remove from staged files
        setStagedFiles(prev =>
          prev.map(f => f.id === stagedFile.id ? { ...f, status: 'complete' } : f)
        );
        removeStagedFile(stagedFile.id);
      }

      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload one or more files');

      // Mark failed files
      newStagedFiles.forEach(file => {
        setStagedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, status: 'error' } : f)
        );
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [chatId, createStagedFile, removeStagedFile, setAttachments]);

  // Focus management
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [messages.length]); // Refocus after new message

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    console.log('🔍 Paste event detected');
    
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for images in clipboard
    const items = Array.from(clipboardData.items);
    const imageItems = items.filter(item => 
      item.kind === 'file' && item.type.startsWith('image/')
    );

    if (imageItems.length > 0) {
      e.preventDefault();
      console.log('📸 Found image in clipboard');

      // Convert clipboard items to files
      const files = imageItems
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null)
        .map(file => new File([file], 
          `screenshot-${Date.now()}.${file.type.split('/')[1] || 'png'}`,
          { type: file.type }
        ));

      // Create staged files with blob URLs
      const newStagedFiles = files.map(createStagedFile);
      setStagedFiles(prev => [...prev, ...newStagedFiles]);

      try {
        // Upload each file using existing upload logic
        for (const stagedFile of newStagedFiles) {
          setStagedFiles(prev =>
            prev.map(f => f.id === stagedFile.id ? { ...f, status: 'uploading' } : f)
          );

          const formData = new FormData();
          formData.append('file', stagedFile.file);
          formData.append('chatId', chatId);

          const response = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const data = await response.json();

          // Add to attachments on successful upload
          setAttachments(current => [...current, {
            url: data.url,
            name: stagedFile.file.name,
            contentType: stagedFile.file.type,
            path: data.path
          }]);

          // Mark as complete and remove from staged files
          setStagedFiles(prev =>
            prev.map(f => f.id === stagedFile.id ? { ...f, status: 'complete' } : f)
          );
          setTimeout(() => removeStagedFile(stagedFile.id), 500);
        }

        toast.success('Files uploaded successfully');
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Failed to upload one or more files');

        // Mark failed files
        newStagedFiles.forEach(file => {
          setStagedFiles(prev =>
            prev.map(f => f.id === file.id ? { ...f, status: 'error' } : f)
          );
        });
      }
    }
  }, [chatId, createStagedFile, removeStagedFile, setAttachments]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {isLoading && expectingText && <ChatSkeleton />}
      
      {messages.length === 0 &&
        attachments.length === 0 &&
        stagedFiles.length === 0 && (
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
                  onClick={() => handleSuggestedAction(suggestedAction.action)}
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

      {(attachments.length > 0 || stagedFiles.length > 0) && (
        <div className="flex flex-row gap-4 overflow-x-auto pb-2">
          {stagedFiles.map((stagedFile) => (
            <div key={stagedFile.id} className="relative group">
              <PreviewAttachment
                attachment={{
                  url: stagedFile.previewUrl,
                  name: stagedFile.file.name,
                  contentType: stagedFile.file.type,
                }}
                isUploading={stagedFile.status === 'uploading'}
                onRemove={() => removeStagedFile(stagedFile.id)}
              />
              {stagedFile.status === 'error' && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center rounded-lg">
                  <span className="text-xs text-destructive">Upload failed</span>
                </div>
              )}
            </div>
          ))}

          {attachments.map((attachment) => (
            <div key={attachment.url} className="relative group">
              <PreviewAttachment
                attachment={attachment}
                onRemove={() => {
                  setAttachments(current =>
                    current.filter(a => a.url !== attachment.url)
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        onPaste={handlePaste}
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
          disabled={input.length === 0 || stagedFiles.length > 0}
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
