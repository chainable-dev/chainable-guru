import { X } from "lucide-react";
import { formatFileName } from "@/lib/utils/format-filename";
import { Button } from "../ui/button";

interface Attachment {
	url: string;
	name: string;
	contentType: string;
	path?: string;
}

interface PreviewAttachmentProps {
	attachment: Attachment;
	isUploading?: boolean;
	onRemove?: () => void;
}

export function PreviewAttachment({
	attachment,
	isUploading,
	onRemove,
}: PreviewAttachmentProps) {
	const isImage = attachment.contentType.startsWith("image/");
	const displayName = formatFileName(attachment.name);

	return (
		<div className="relative group">
			<div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
				{isImage ? (
					<img
						src={attachment.url}
						alt={displayName}
						className="size-10 object-cover rounded"
					/>
				) : (
					<div className="size-10 flex items-center justify-center rounded bg-muted">
						<span className="text-xs text-muted-foreground">
							{attachment.contentType.split("/")[1]?.toUpperCase()}
						</span>
					</div>
				)}

				<div className="flex flex-col min-w-0">
					<span className="text-sm truncate" title={attachment.name}>
						{displayName}
					</span>
					{isUploading && (
						<span className="text-xs text-muted-foreground">Uploading...</span>
					)}
				</div>

				{onRemove && (
					<Button
						variant="ghost"
						size="icon"
						className="absolute -top-2 -right-2 size-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={onRemove}
					>
						<X className="size-3" />
					</Button>
				)}
			</div>
		</div>
	);
}
