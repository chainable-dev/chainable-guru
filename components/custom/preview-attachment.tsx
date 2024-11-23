import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

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
  const [imageError, setImageError] = useState(false);
  const isBlob = attachment.url.startsWith('blob:');

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image: ${attachment.url}`);
  };

  const renderImage = () => {
    if (imageError || isBlob) {
      return (
        <img 
          src={isBlob ? attachment.url : '/placeholder-image.png'}
          alt={altText}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      );
    }

    return (
      <div className="relative h-full w-full">
        <Image
          src={attachment.url}
          alt={altText}
          className="object-cover"
          fill
          sizes="200px"
          onError={handleImageError}
          unoptimized={attachment.url.includes('vercel-storage.com')}
        />
      </div>
    );
  };

  return (
    <div className="relative group">
      <div className={cn(
        "relative h-20 w-20 border rounded-lg overflow-hidden bg-muted",
        isUploading && "opacity-70"
      )}>
        {isImage && !imageError ? (
          renderImage()
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {onRemove && !isUploading && (
        <button
          onClick={() => onRemove(attachment.url)}
          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={`Remove ${altText}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <div className="mt-1 truncate text-center text-xs text-muted-foreground">
        {altText}
      </div>
    </div>
  );
}
