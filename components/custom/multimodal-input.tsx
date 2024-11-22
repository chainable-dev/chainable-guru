'use client';

import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Wallet as WalletIcon } from 'lucide-react';
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  Dispatch,
  SetStateAction,
  ChangeEvent,
} from 'react';
import { RiArrowDownSLine, RiArrowUpSLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import Image from 'next/image';

import { useWalletState } from '@/hooks/useWalletState';
import { createClient } from '@/lib/supabase/client';
import { sanitizeUIMessages } from '@/lib/utils';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { Suggestion } from './suggestion';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

import type { Attachment as SupabaseAttachment } from '@/types/supabase';
import type { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai';

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
  {
    title: 'Check my wallet balance',
    label: 'on Base chain',
    action: 'Using the information from my connected crypto wallet, what is the balance of my wallet?',
  },
  {
    title: 'Deploy a smart contract',
    label: 'on Base Sepolia',
    action: 'Help me deploy a basic ERC20 token smart contract on Base Sepolia testnet',
  },
  {
    title: 'Analyze my NFTs', 
    label: 'in my wallet',
    action: 'Show me all NFTs in my connected wallet and analyze their rarity',
  },
  {
    title: 'Track gas prices',
    label: 'on Base',
    action: 'What are the current gas prices on Base network and when is the best time to transact?',
  }
];

// Add type for suggestions lock state
type SuggestionsLockState = {
  isLocked: boolean;
  lockedSuggestions: typeof suggestedActions;
};

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

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [suggestionsLock, setSuggestionsLock] = useLocalStorage<SuggestionsLockState>('suggestions-lock', {
    isLocked: false,
    lockedSuggestions: suggestedActions
  });
  const [showSuggestions, setShowSuggestions] = useState(true);

  const {
    address,
    isConnected,
    chainId,
    networkInfo,
    isCorrectNetwork
  } = useWalletState();

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
      return prev.filter(f => f.id !== fileId);
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

  // Add a check for wallet readiness
  const isWalletReady = useCallback(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return false;
    }
    if (!isCorrectNetwork) {
      toast.error('Please switch to Base Mainnet or Base Sepolia');
      return false;
    }
    return true;
  }, [isConnected, isCorrectNetwork]);

  const submitForm = useCallback(async () => {
    if (!input && attachments.length === 0) return;

    const isWalletQuery = input.toLowerCase().includes('wallet') || 
                         input.toLowerCase().includes('balance');

    if (isWalletQuery && !isWalletReady()) {
      return;
    }

    const messageContent = {
      text: input,
      attachments: attachments.map(att => ({
        url: att.url,
        name: att.name,
        type: att.contentType,
      })),
      ...(isWalletQuery && {
        walletAddress: address,
        chainId,
        network: networkInfo?.name || 'unknown',
        isWalletConnected: isConnected,
        isCorrectNetwork
      })
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
    }
  }, [
    input,
    attachments,
    append,
    setInput,
    setLocalStorageInput,
    address,
    chainId,
    networkInfo,
    setAttachments,
    isConnected,
    isCorrectNetwork,
    isWalletReady
  ]);

  const handleSuggestedAction = useCallback((action: string) => {
    const isWalletAction = action.toLowerCase().includes('wallet') || 
                          action.toLowerCase().includes('balance');
    
    if (isWalletAction && !isWalletReady()) {
      return;
    }

    setInput(action);
    submitForm();
  }, [isWalletReady, setInput, submitForm]);

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Create staged files with blob URLs
    const newStagedFiles = files.map(createStagedFile);
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

  return (
    <div className="relative w-full flex flex-col gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="absolute -top-2 right-0 z-10 size-8 p-0 hover:bg-muted/80"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        {showSuggestions ? (
          <RiArrowUpSLine className="size-4" />
        ) : (
          <RiArrowDownSLine className="size-4" />
        )}
      </Button>

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
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                {stagedFile.file.type.startsWith('image/') ? (
                  <Image
                    src={stagedFile.previewUrl}
                    alt={stagedFile.file.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-2">
                    <span className="text-xs truncate">{stagedFile.file.name}</span>
                  </div>
                )}
                {stagedFile.status === 'uploading' && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              <button
                onClick={() => removeStagedFile(stagedFile.id)}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-muted/90 hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}

          {attachments.map((attachment) => (
            <div key={attachment.url} className="relative group">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                {attachment.contentType?.startsWith('image/') ? (
                  <Image
                    src={attachment.url}
                    alt={attachment.name || 'Uploaded file'}
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-2">
                    <span className="text-xs truncate">{attachment.name}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setAttachments(current => 
                  current.filter(a => a.url !== attachment.url)
                )}
                className="absolute -top-2 -right-2 size-5 rounded-full bg-muted/90 hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showSuggestions && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid sm:grid-cols-2 gap-2 w-full overflow-hidden"
          >
            {suggestedActions.map((suggestedAction, index) => (
              <div
                key={index}
                className={index > 1 ? 'hidden sm:block' : 'block'}
              >
                <Button
                  variant="ghost"
                  onClick={() => handleSuggestedAction(suggestedAction.action)}
                  className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-muted/50"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-muted-foreground">
                    {suggestedAction.label}
                  </span>
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
          <div className={cx(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <WalletIcon className="size-4" />
          <span className="text-muted-foreground">
            {isConnected ? (
              <>
                {address}
                {!isCorrectNetwork && (
                  <span className="ml-2 text-destructive">
                    ⚠️ Wrong Network
                  </span>
                )}
                <span className="ml-2 text-muted-foreground">
                  ({networkInfo?.name})
                </span>
              </>
            ) : (
              'Not Connected'
            )}
          </span>
        </div>
      </div>

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
          disabled={input.length === 0 && attachments.length === 0}
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

