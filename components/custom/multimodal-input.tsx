"use client";

import cx from "classnames";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, {
	useRef,
	useEffect,
	useState,
	useCallback,
	Dispatch,
	SetStateAction,
	ChangeEvent,
	FormEvent,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { useWalletState } from "@/hooks/useWalletState";
import { createClient } from "@/lib/supabase/client";
import { sanitizeUIMessages } from "@/lib/utils";

import { ArrowUpIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

import type { Attachment as SupabaseAttachment } from "@/types/supabase";
import type {
	Attachment,
	ChatRequestOptions,
	CreateMessage,
	Message,
} from "ai";

const suggestedActions = [
	{
		title: "Create a new document",
		label: 'with the title "My New Document"',
		action: 'Create a new document with the title "My New Document"',
	},
	{
		title: "Update an existing document",
		label: 'with the description "Add more details"',
		action:
			'Update the document with ID "123" with the description "Add more details"',
	},
	{
		title: "Request suggestions for a document",
		label: 'with ID "123"',
		action: 'Request suggestions for the document with ID "123"',
	},
	{
		title: "Get the current weather",
		label: "in San Francisco",
		action: "Get the current weather in San Francisco",
	},
	{
		title: "Check wallet balance",
		label: "for my connected wallet",
		action: "Check the balance of my connected wallet",
	},
	{
		title: "Check wallet state",
		label: "for my connected wallet",
		action: "Check the state of my connected wallet",
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
	status: "staging" | "uploading" | "complete" | "error";
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
	append: (
		message: Message | CreateMessage,
		chatRequestOptions?: ChatRequestOptions,
	) => Promise<string | null | undefined>;
	handleSubmit: (
		event?: { preventDefault?: () => void },
		chatRequestOptions?: ChatRequestOptions,
	) => void;
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
	chatId,
}: MultimodalInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const { width } = useWindowSize();
	const supabase = createClient();
	const { address, isConnected, chainId, networkInfo, isCorrectNetwork } =
		useWalletState();

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
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
		}
	};

	const [localStorageInput, setLocalStorageInput] = useLocalStorage(
		"input",
		"",
	);

	useEffect(() => {
		if (textareaRef.current) {
			const domValue = textareaRef.current.value;
			// Prefer DOM value over localStorage to handle hydration
			const finalValue = domValue || localStorageInput || "";
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
			status: "staging",
		};
	}, []);

	// Clean up blob URLs when files are removed
	const removeStagedFile = useCallback((fileId: string) => {
		setStagedFiles((prev) => {
			const file = prev.find((f) => f.id === fileId);
			if (file) {
				URL.revokeObjectURL(file.previewUrl);
			}
			const updatedFiles = prev.filter((f) => f.id !== fileId);
			if (file) {
				stagedFileNames.current.delete(file.file.name);
			}
			return updatedFiles;
		});
	}, []);

	// Clean up all blob URLs on unmount
	useEffect(() => {
		return () => {
			stagedFiles.forEach((file) => {
				URL.revokeObjectURL(file.previewUrl);
			});
		};
	}, [stagedFiles]);

	const submitForm = useCallback(async () => {
		if (!input && attachments.length === 0) return;

		// Set expecting text based on input type
		setExpectingText(true);

		// Always include wallet state in message content
		const messageContent = {
			text: input,
			attachments: attachments.map((att) => ({
				url: att.url,
				name: att.name,
				type: att.contentType,
			})),
			walletAddress: address,
			chainId,
			network: networkInfo?.name,
			isWalletConnected: isConnected,
			isCorrectNetwork,
		};

		try {
			await append(
				{
					role: "user",
					content: JSON.stringify(messageContent),
				},
				{
					experimental_attachments: attachments,
				},
			);

			setInput("");
			setAttachments([]);
			setLocalStorageInput("");
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
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
		networkInfo,
	]);

	const handleSuggestedAction = useCallback(
		(action: string) => {
			const isWalletAction =
				action.toLowerCase().includes("wallet") ||
				action.toLowerCase().includes("balance");

			if (isWalletAction) {
				if (!isConnected) {
					toast.error("Please connect your wallet first");
					return;
				}
				if (!isCorrectNetwork) {
					toast.error("Please switch to Base Mainnet or Base Sepolia");
					return;
				}
			}

			setInput(action);
			submitForm();
		},
		[isConnected, isCorrectNetwork, setInput, submitForm],
	);

	const ALLOWED_MIME_TYPES = [
	  'image/jpeg',
	  'image/png',
	  'image/gif',
	  'image/webp',
	  'application/pdf',
	  'text/plain',
	  'application/msword',
	  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	];

	const uploadFileWithRetry = async (file: File, chatId: string, retries = 3) => {
  try {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const fileName = `${chatId}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat_attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(data.path);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Upload error:', error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return uploadFileWithRetry(file, chatId, retries - 1);
    }
    throw error;
  }
};

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);
	
			// Check file size and type limits
			const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
			const invalidFiles = files.filter(file => 
			  file.size > MAX_FILE_SIZE || !ALLOWED_MIME_TYPES.includes(file.type)
			);
	
			if (invalidFiles.length > 0) {
			  toast.error(
			    `Invalid files: ${invalidFiles.map(f => f.name).join(', ')}\n` +
			    'Files must be smaller than 10MB and in supported format.'
			  );
			  return;
			}
	
			// Create staged files with blob URLs
			const newStagedFiles = files
				.filter((file) => !stagedFileNames.current.has(file.name))
				.map((file) => {
					stagedFileNames.current.add(file.name);
					return createStagedFile(file);
				});
	
			if (newStagedFiles.length === 0) {
				toast.error('No new files to upload');
				return;
			}
	
			setStagedFiles((prev) => [...prev, ...newStagedFiles]);
	
			try {
				// Upload each file
				for (const stagedFile of newStagedFiles) {
					setStagedFiles(prev =>
						prev.map(f =>
							f.id === stagedFile.id ? { ...f, status: "uploading" } : f
						)
					);
	
					try {
						let base64Data = null;
						if (stagedFile.file.type.startsWith('image/')) {
							const reader = new FileReader();
							base64Data = await new Promise((resolve) => {
								reader.onload = () => resolve(reader.result?.toString().split(',')[1]);
								reader.readAsDataURL(stagedFile.file);
							});
						}
	
						const data = await uploadFileWithRetry(stagedFile.file, chatId);
                        if (data) {
                            const attachment = {
                                url: data.url,
                                name: stagedFile.file.name,
                                contentType: stagedFile.file.type,
                                path: data.path,
                                base64: base64Data
                            };
                            setAttachments(prev => [...prev, attachment]);
                            setStagedFiles(prev =>
                                prev.filter(f => f.id !== stagedFile.id)
                            );
                        }
					} catch (error: unknown) {
						console.error(`Error uploading ${stagedFile.file.name}:`, error);
						const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
						toast.error(`Failed to upload ${stagedFile.file.name}: ${errorMessage}`);
						setStagedFiles(prev =>
							prev.map(f =>
								f.id === stagedFile.id ? { ...f, status: "error" } : f
							)
						);
					}
				}
			} catch (error) {
				console.error("Error in file upload process:", error);
			}
		},
		[chatId, createStagedFile, removeStagedFile, setAttachments],
	);

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

	const handlePaste = useCallback(
		async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			try {
				const clipboardData = e.clipboardData;
				if (!clipboardData) return;
		
				const items = Array.from(clipboardData.items);
				const imageItems = items.filter(
					item => item.kind === "file" && 
				             item.type.startsWith("image/") && 
				             ALLOWED_MIME_TYPES.includes(item.type)
				    );
		
				if (imageItems.length > 0) {
					e.preventDefault();
		
					const files = imageItems
						.map(item => item.getAsFile())
						.filter((file): file is File => file !== null)
						.map(file => 
							new File(
								[file],
								`screenshot-${Date.now()}.${file.type.split("/")[1] || "png"}`,
								{ type: file.type }
							)
						);
		
					try {
						const newStagedFiles = files.map(file => createStagedFile(file));
						setStagedFiles(prev => [...prev, ...newStagedFiles]);
		
						for (const stagedFile of newStagedFiles) {
							try {
								const reader = new FileReader();
								const base64Data = await new Promise<string>((resolve) => {
									reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
									reader.readAsDataURL(stagedFile.file);
								});

								const data = await uploadFileWithRetry(stagedFile.file, chatId);
								if (data) {
									const attachment = {
										url: data.url,
										name: stagedFile.file.name,
										contentType: stagedFile.file.type,
										path: data.path,
										base64: base64Data
									};
									setAttachments(prev => [...prev, attachment]);
									setStagedFiles(prev =>
										prev.filter(f => f.id !== stagedFile.id)
									);
								}
							} catch (error) {
								console.error(`Error uploading pasted image:`, error);
								toast.error(`Failed to upload pasted image`);
								setStagedFiles(prev =>
									prev.map(f =>
										f.id === stagedFile.id ? { ...f, status: "error" } : f
									)
								);
							}
						}
					} catch (error) {
						console.error("Error in paste upload process:", error);
					}
				}
			} catch (error) {
				console.error("Error accessing clipboard data:", error);
				toast.error("Failed to access clipboard data");
			}
		},
		[chatId, createStagedFile, removeStagedFile, setAttachments],
	);

	return (
		<div className="relative w-full flex flex-col gap-4">
			{isLoading && expectingText && (
				<div className="animate-pulse space-y-4">
					<div className="h-4 bg-gray-300 rounded w-3/4"></div>
					<div className="h-4 bg-gray-300 rounded w-5/6"></div>
					<div className="h-4 bg-gray-300 rounded w-2/3"></div>
				</div>
			)}

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
								className={cx("group", index > 1 ? "hidden sm:block" : "block")}
							>
								<Button
									variant="ghost"
									onClick={() => handleSuggestedAction(suggestedAction.action)}
									className="text-left border rounded-xl px-4 py-3.5 text-sm w-full h-auto flex flex-col items-start gap-1 transition-colors hover:bg-muted/80"
								>
									<span className="font-medium group-hover:text-primary">
										{suggestedAction.title}
									</span>
									<span className="text-muted-foreground text-xs">
										{suggestedAction.label}
									</span>
								</Button>
							</motion.div>
						))}
					</div>
				)}

			<input
				type="file"
				className="sr-only"
				ref={fileInputRef}
				multiple
				onChange={handleFileChange}
				tabIndex={-1}
				aria-hidden="true"
			/>

			{(attachments.length > 0 || stagedFiles.length > 0) && (
				<div className="flex flex-row gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
					{stagedFiles.map((stagedFile) => (
						<div key={stagedFile.id} className="relative group">
							<PreviewAttachment
								attachment={{
									url: stagedFile.previewUrl,
									name: stagedFile.file.name,
									contentType: stagedFile.file.type,
								}}
								isUploading={stagedFile.status === "uploading"}
								onRemove={() => removeStagedFile(stagedFile.id)}
							/>
							{stagedFile.status === "error" && (
								<div className="absolute inset-0 bg-destructive/20 flex items-center justify-center rounded-lg">
									<span className="text-xs text-destructive">
										Upload failed
									</span>
								</div>
							)}
						</div>
					))}

					{attachments.map((attachment) => (
						<div key={attachment.url} className="relative group">
							<PreviewAttachment
								//@ts-ignore
								attachment={attachment}
								onRemove={() =>
									setAttachments((current) =>
										current.filter((a) => a.url !== attachment.url)
									)
								}
							/>
						</div>
					))}
				</div>
			)}

			<div className="relative flex items-end gap-2">
				<Textarea
					ref={textareaRef}
					placeholder="Send a message..."
					value={input}
					onChange={handleInput}
					onPaste={handlePaste}
					className={cx(
						"min-h-[24px] max-h-[calc(75dvh)] pr-24",
						"overflow-hidden resize-none rounded-xl text-base",
						"bg-muted border-muted-foreground/20",
						"focus:ring-1 focus:ring-primary/20",
						"placeholder:text-muted-foreground/50",
						className,
					)}
					rows={1}
					autoFocus
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							if (isLoading) {
								toast.error(
									"Please wait for the model to finish its response!",
								);
							} else {
								submitForm();
							}
						}
					}}
				/>

				<div className="absolute bottom-2 right-2 flex items-center gap-2">
					<Button
						size="icon"
						variant="outline"
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="size-8 rounded-full"
					>
						<PaperclipIcon  />
					</Button>

					<Button
						size="icon"
						variant={input.length > 0 ? "default" : "outline"}
						onClick={(e) => {
							e.preventDefault();
							isLoading ? stop() : submitForm();
						}}
						disabled={input.length === 0 || stagedFiles.length > 0}
						className="size-8 rounded-full"
					>
						{isLoading ? (
							<StopIcon  />
						) : (
							<ArrowUpIcon  />
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
