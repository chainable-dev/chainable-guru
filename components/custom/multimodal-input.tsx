"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/custom/wallet-button";
import { BetterTooltip } from "@/components/ui/tooltip";
import { PaperclipIcon, StopIcon, ArrowUpIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { motion } from "framer-motion";
import cx from "classnames";

const suggestedActions = [
	{
		title: "Create a new document",
		label: 'with the title "My New Document"',
		action: 'Create a new document with the title "My New Document"',
	},
	{
		title: "Update an existing document",
		label: 'with the description "Add more details"',
		action: 'Update the document with ID "123" with the description "Add more details"',
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

interface FileUploadState {
	progress: number;
	uploading: boolean;
	error: string | null;
}

export function MultimodalInput({
	input,
	setInput,
	isLoading,
	stop,
	messages,
	setMessages,
	append,
	handleSubmit,
	chatId,
}: {
	input: string;
	setInput: (value: string) => void;
	isLoading: boolean;
	stop: () => void;
	messages: any[];
	setMessages: (messages: any[]) => void;
	append: (message: any) => void;
	handleSubmit: (e: React.FormEvent) => void;
	chatId: string;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileUpload, setFileUpload] = useState<FileUploadState>({
		progress: 0,
		uploading: false,
		error: null,
	});
	const [attachments, setAttachments] = useState<any[]>([]);

	const handleFileUpload = async (file: File) => {
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("File size must be less than 10MB");
			return;
		}

		setFileUpload({ progress: 0, uploading: true, error: null });

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('chatId', chatId);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) throw new Error('Upload failed');

			const data = await response.json();
			toast.success("File uploaded successfully");
			
			setAttachments(prev => [...prev, {
				url: data.url,
				name: file.name,
				type: file.type
			}]);
			
			append({
				role: "user",
				content: `[File uploaded: ${file.name}](${data.url})`,
			});
		} catch (error) {
			console.error('Error uploading file:', error);
			toast.error(`Failed to upload ${file.name}`);
			setFileUpload(prev => ({
				...prev,
				error: "Upload failed",
			}));
		} finally {
			setFileUpload(prev => ({ ...prev, uploading: false }));
		}
	};

	const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files || []);
		for (const file of files) {
			await handleFileUpload(file);
		}
	}, []);

	const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const items = Array.from(e.clipboardData.items);
		const imageItems = items.filter(item => item.type.startsWith('image/'));

		if (imageItems.length > 0) {
			e.preventDefault();
			for (const item of imageItems) {
				const file = item.getAsFile();
				if (file) {
					await handleFileUpload(file);
				}
			}
		}
	}, []);

	const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
		e.preventDefault();
		const files = Array.from(e.dataTransfer.files);
		for (const file of files) {
			await handleFileUpload(file);
		}
	}, []);

	const handleFileClick = () => {
		fileInputRef.current?.click();
	};

	const handleSuggestedAction = useCallback((action: string) => {
		setInput(action);
		// Trigger form submission with the suggested action
		const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
		handleSubmit(formEvent);
	}, [setInput, handleSubmit]);

	return (
		<div className="relative w-full">
			<input
				type="file"
				className="hidden"
				ref={fileInputRef}
				onChange={handleFileChange}
				multiple
			/>

			{messages.length === 0 && attachments.length === 0 && (
				<div className="grid sm:grid-cols-2 gap-2 w-full mb-4">
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

			{attachments.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-2">
					{attachments.map((attachment, index) => (
						<PreviewAttachment
							key={index}
							attachment={attachment}
							onRemove={() => {
								setAttachments(prev => prev.filter((_, i) => i !== index));
							}}
						/>
					))}
				</div>
			)}

			<form onSubmit={handleSubmit} className="flex gap-2">
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onPaste={handlePaste}
					onDrop={handleDrop}
					onDragOver={(e) => e.preventDefault()}
					placeholder="Type a message..."
					className="flex-1 min-h-[44px] max-h-32 p-2 rounded-md border bg-background resize-none"
					disabled={isLoading}
					rows={1}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
				/>
				<div className="flex gap-2">
					<WalletButton />
					<BetterTooltip content="Attach files">
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={handleFileClick}
							disabled={isLoading}
						>
							<PaperclipIcon className="h-4 w-4" />
							<span className="sr-only">Attach files</span>
						</Button>
					</BetterTooltip>
					<Button
						type="submit"
						disabled={!input.trim() && attachments.length === 0}
					>
						{isLoading ? (
							<StopIcon className="h-4 w-4" onClick={stop} />
						) : (
							<ArrowUpIcon className="h-4 w-4" />
						)}
						<span className="sr-only">
							{isLoading ? "Stop generating" : "Send message"}
						</span>
					</Button>
				</div>
			</form>

			{fileUpload.uploading && (
				<div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
					<div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
						<div
							className="h-full bg-primary transition-all duration-300"
							style={{ width: `${fileUpload.progress}%` }}
						/>
					</div>
					<p className="text-sm text-muted-foreground mt-2 text-center">
						Uploading... {fileUpload.progress}%
					</p>
				</div>
			)}
		</div>
	);
}
