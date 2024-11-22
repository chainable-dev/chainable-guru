import { FileIcon } from 'lucide-react';
import Image from 'next/image';

import type { Attachment } from 'ai';

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: (url: string) => void;
}

const PreviewImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const isBlob = src.startsWith('blob:');
  
  if (isBlob) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={200}
      height={200}
    />
  );
};

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
          <div className="relative w-full h-full">
            <PreviewImage
              src={attachment.url}
              alt={altText}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
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
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(attachment.url)}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Remove ${altText}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}

      <div className="mt-1 text-xs text-muted-foreground truncate text-center">
        {altText}
      </div>
    </div>
  );
}
