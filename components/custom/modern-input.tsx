"use client";

import cx from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import { ModernIcons } from "./modern-icons";
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

import { createClient } from "@/lib/supabase/client";
import { errorHandler } from "@/lib/error-handling";

import { PreviewAttachment } from "./preview-attachment";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import type { Attachment as SupabaseAttachment } from "@/types/supabase";
import type {
	Attachment,
	ChatRequestOptions,
	CreateMessage,
	Message,
} from "ai";

const suggestedActions = [
	{
		title: "Help me get started",
		label: "Show me what you can do",
		action: "What can you help me with? Please show me your capabilities and how to get started.",
		icon: "🚀",
	},
	{
		title: "Create a document",
		label: "Start a new project",
		action: "Help me create a new document for my project. I'd like to get started with a structured outline.",
		icon: "📝",
	},
	{
		title: "Research assistance",
		label: "Find information on a topic",
		action: "I need help researching a topic. Can you help me find reliable information and summarize key points?",
		icon: "🔍",
	},
	{
		title: "Code review",
		label: "Review and improve code",
		action: "I have some code that I'd like you to review. Can you help me identify potential improvements and best practices?",
		icon: "💻",
	},
];

interface StagedFile {
	id: string;
	file: File;
	previewUrl: string;
	status: "staging" | "uploading" | "complete" | "error";
}

interface ModernInputProps {
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

export function ModernInput({
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
}: ModernInputProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { width } = useWindowSize();
	const supabase = createClient();

	const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
	const [expectingText, setExpectingText] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const stagedFileNames = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (textareaRef.current) {
			adjustHeight();
		}
	}, []);

	const adjustHeight = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
		}
	};

	const [localStorageInput, setLocalStorageInput] = useLocalStorage(
		"input",
		"",
	);

	useEffect(() => {
		if (textareaRef.current) {
			const domValue = textareaRef.current.value;
			const finalValue = domValue || localStorageInput || "";
			setInput(finalValue);
			adjustHeight();
		}
	}, []);

	useEffect(() => {
		setLocalStorageInput(input);
	}, [input, setLocalStorageInput]);

	const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setInput(event.target.value);
		adjustHeight();
	};

	const createStagedFile = useCallback((file: File): StagedFile => {
		return {
			id: crypto.randomUUID(),
			file,
			previewUrl: URL.createObjectURL(file),
			status: "staging",
		};
	}, []);

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

	useEffect(() => {
		return () => {
			stagedFiles.forEach((file) => {
				URL.revokeObjectURL(file.previewUrl);
			});
		};
	}, [stagedFiles]);

	const submitForm = useCallback(async () => {
		if (!input && attachments.length === 0) return;

		setExpectingText(true);

		const messageContent = {
			text: input,
			attachments: attachments.map((att) => ({
				url: att.url,
				name: att.name,
				type: att.contentType,
			})),
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
			setShowSuggestions(false);
		} catch (error) {
			errorHandler.showError(error, "chat message submission");
		} finally {
			setExpectingText(false);
		}
	}, [
		input,
		attachments,
		append,
		setInput,
		setLocalStorageInput,
		setAttachments,
	]);

	const handleSuggestedAction = useCallback(
		(action: string) => {
			setInput(action);
			submitForm();
		},
		[setInput, submitForm],
	);

	const uploadFileWithRetry = useCallback(
		async (stagedFile: StagedFile, maxRetries = 3): Promise<boolean> => {
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					const formData = new FormData();
					formData.append("file", stagedFile.file);
					formData.append("chatId", chatId);

					const response = await fetch("/api/files/upload", {
						method: "POST",
						body: formData,
					});

					if (!response.ok) {
						throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
					}

					const data = await response.json();

					setAttachments((current) => [
						...current,
						{
							url: data.url,
							name: stagedFile.file.name,
							contentType: stagedFile.file.type,
							path: data.path,
						},
					]);

					setStagedFiles((prev) =>
						prev.map((f) =>
							f.id === stagedFile.id ? { ...f, status: "complete" } : f,
						),
					);
					removeStagedFile(stagedFile.id);
					return true;
				} catch (error) {
					console.error(`Upload attempt ${attempt} failed:`, error);
					
					if (attempt === maxRetries) {
						setStagedFiles((prev) =>
							prev.map((f) => (f.id === stagedFile.id ? { ...f, status: "error" } : f)),
						);
						return false;
					}
					
					await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
				}
			}
			return false;
		},
		[chatId, setAttachments, removeStagedFile],
	);

	const handleFileChange = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(event.target.files || []);

			const newStagedFiles = files
				.filter((file) => !stagedFileNames.current.has(file.name))
				.map((file) => {
					stagedFileNames.current.add(file.name);
					return createStagedFile(file);
				});
			setStagedFiles((prev) => [...prev, ...newStagedFiles]);

			try {
				const uploadPromises = newStagedFiles.map(async (stagedFile) => {
					setStagedFiles((prev) =>
						prev.map((f) =>
							f.id === stagedFile.id ? { ...f, status: "uploading" } : f,
						),
					);

					return await uploadFileWithRetry(stagedFile);
				});

				const results = await Promise.all(uploadPromises);
				const successCount = results.filter(Boolean).length;
				const failureCount = results.length - successCount;

				if (successCount > 0) {
					toast.success(`${successCount} file(s) uploaded successfully`);
				}
				if (failureCount > 0) {
					toast.error(`${failureCount} file(s) failed to upload. You can try uploading them again.`);
				}
			} catch (error) {
				errorHandler.showError(error, "file upload");
			} finally {
				if (fileInputRef.current) {
					fileInputRef.current.value = "";
				}
			}
		},
		[createStagedFile, uploadFileWithRetry],
	);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.focus();
		}
	}, [messages.length]);

	useEffect(() => {
		const timer = setTimeout(() => {
			textareaRef.current?.focus();
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	const handlePaste = useCallback(
		async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const clipboardData = e.clipboardData;
			if (!clipboardData) return;

			const items = Array.from(clipboardData.items);
			const imageItems = items.filter(
				(item) => item.kind === "file" && item.type.startsWith("image/"),
			);

			if (imageItems.length > 0) {
				e.preventDefault();

				const files = imageItems
					.map((item) => item.getAsFile())
					.filter((file): file is File => file !== null)
					.map(
						(file) =>
							new File(
								[file],
								`screenshot-${Date.now()}.${file.type.split("/")[1] || "png"}`,
								{ type: file.type },
							),
					);

				const newStagedFiles = files.map(createStagedFile);
				setStagedFiles((prev) => [...prev, ...newStagedFiles]);

				try {
					for (const stagedFile of newStagedFiles) {
						setStagedFiles((prev) =>
							prev.map((f) =>
								f.id === stagedFile.id ? { ...f, status: "uploading" } : f,
							),
						);

						const formData = new FormData();
						formData.append("file", stagedFile.file);
						formData.append("chatId", chatId);

						const response = await fetch("/api/files/upload", {
							method: "POST",
							body: formData,
						});

						if (!response.ok) throw new Error("Upload failed");

						const data = await response.json();

						setAttachments((current) => [
							...current,
							{
								url: data.url,
								name: stagedFile.file.name,
								contentType: stagedFile.file.type,
								path: data.path,
							},
						]);

						setStagedFiles((prev) =>
							prev.map((f) =>
								f.id === stagedFile.id ? { ...f, status: "complete" } : f,
							),
						);
						removeStagedFile(stagedFile.id);
					}

					toast.success("Files uploaded successfully");
				} catch (error) {
					console.error("Error uploading files:", error);
					toast.error("Failed to upload one or more files");

					newStagedFiles.forEach((file) => {
						setStagedFiles((prev) =>
							prev.map((f) =>
								f.id === file.id ? { ...f, status: "error" } : f,
							),
						);
					});
				}
			}
		},
		[chatId, createStagedFile, removeStagedFile, setAttachments],
	);

	const canSend = input.trim().length > 0 || attachments.length > 0;

	return (
		<div className="relative w-full">
			{/* Suggestions */}
			<AnimatePresence>
				{messages.length === 0 && showSuggestions && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className="mb-4 grid sm:grid-cols-2 gap-2"
					>
						{suggestedActions.map((suggestedAction, index) => (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 * index }}
								key={index}
								className={cx("group", index > 1 ? "hidden sm:block" : "block")}
							>
								<Button
									variant="ghost"
									onClick={() => handleSuggestedAction(suggestedAction.action)}
									className="text-left border rounded-xl px-4 py-3.5 text-sm w-full h-auto flex flex-col items-start gap-1 transition-all hover:bg-muted/80 hover:scale-[1.02]"
								>
									<div className="flex items-center gap-2">
										<span className="text-lg">{suggestedAction.icon}</span>
										<span className="font-medium group-hover:text-primary">
											{suggestedAction.title}
										</span>
									</div>
									<span className="text-muted-foreground text-xs">
										{suggestedAction.label}
									</span>
								</Button>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* File Input */}
			<input
				type="file"
				className="sr-only"
				ref={fileInputRef}
				multiple
				onChange={handleFileChange}
				tabIndex={-1}
				aria-hidden="true"
				accept="image/*,.pdf,.doc,.docx,.txt"
			/>

			{/* Attachments */}
			<AnimatePresence>
				{(attachments.length > 0 || stagedFiles.length > 0) && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="flex flex-row gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
					>
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
					</motion.div>
				)}
			</AnimatePresence>

			{/* Input Container */}
			<div className={cx(
				"relative flex items-end gap-2 p-3 rounded-2xl border transition-all duration-200",
				"bg-background/80 backdrop-blur-sm",
				isFocused 
					? "border-primary/50 shadow-lg shadow-primary/10" 
					: "border-border/50 hover:border-border",
				className
			)}>
				{/* Attachment Button */}
				<Tooltip>
					<TooltipTrigger asChild>
											<Button
						size="icon"
						variant="ghost"
						onClick={() => fileInputRef.current?.click()}
						disabled={isLoading}
						className="size-8 rounded-full hover:bg-muted"
					>
						<ModernIcons.Paperclip size={16} />
					</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Attach files</p>
					</TooltipContent>
				</Tooltip>

				{/* Text Input */}
				<Textarea
					ref={textareaRef}
					placeholder={messages.length === 0 ? "Start a conversation..." : "Send a message..."}
					value={input}
					onChange={handleInput}
					onPaste={handlePaste}
					onFocus={() => {
						setIsFocused(true);
						if (messages.length === 0) {
							setShowSuggestions(true);
						}
					}}
					onBlur={() => setIsFocused(false)}
					className={cx(
						"min-h-[24px] max-h-[120px] pr-12",
						"overflow-hidden resize-none border-0 shadow-none",
						"bg-transparent text-base placeholder:text-muted-foreground/60",
						"focus-visible:ring-0 focus-visible:ring-offset-0",
						className,
					)}
					rows={1}
					autoFocus
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();
							if (isLoading) {
								toast.error("Please wait for the model to finish its response!");
							} else if (canSend) {
								submitForm();
							}
						}
					}}
				/>

				{/* Send Button */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							size="icon"
							variant={canSend ? "default" : "ghost"}
							onClick={(e) => {
								e.preventDefault();
								isLoading ? stop() : submitForm();
							}}
							disabled={!canSend || stagedFiles.length > 0}
							className={cx(
								"size-8 rounded-full transition-all",
								canSend && !isLoading && "hover:scale-105"
							)}
											>
						{isLoading ? (
							<ModernIcons.Stop size={16} />
						) : (
							<ModernIcons.Send size={16} />
						)}
					</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{isLoading ? "Stop generation" : "Send message"}</p>
					</TooltipContent>
				</Tooltip>
			</div>

			{/* Loading State */}
			<AnimatePresence>
				{isLoading && expectingText && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						className="absolute -top-12 left-0 right-0 flex justify-center"
					>
						<div className="bg-muted/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-muted-foreground">
							<div className="flex items-center gap-2">
															<ModernIcons.TypingIndicator size={16} />
								<span>AI is responding...</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
