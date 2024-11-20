import { FileIcon } from 'lucide-react';
import Image from 'next/image';

import type { Attachment } from 'ai';

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: (url: string) => void;
}

export function PreviewAttachment({ 
  attachment, 
  isUploading = false,
  onRemove
}: PreviewAttachmentProps) {
  const isImage = attachment.contentType?.startsWith('image/');
  const altText = attachment.name ?? 'File attachment';

  return (
    <div className="relative group">
      <div className="relative size-20 border rounded-lg overflow-hidden bg-muted">
        {isImage ? (
          <Image
            src={attachment.url}
            alt={altText}
            width={80}
            height={80}
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileIcon className="size-8 text-muted-foreground" />
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {onRemove && (
          <button
            onClick={() => onRemove(attachment.url)}
            className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-background border shadow-sm hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${altText}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-1 text-xs text-muted-foreground truncate text-center">
        {altText}
      </div>
    </div>
  );
}
