import { FileIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";

interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: (url: string) => void;
  existingAttachments?: Attachment[];
}

// Helper function to check for duplicate files
const isDuplicate = (newAttachment: Attachment, existingAttachments: Attachment[] = []): boolean => {
  if (!newAttachment.name) return false;
  
  return existingAttachments.some(existing => 
    existing.name === newAttachment.name || existing.url === newAttachment.url
  );
};

export function PreviewAttachment({ 
  attachment, 
  isUploading = false,
  onRemove,
  existingAttachments = []
}: PreviewAttachmentProps) {
  const isImage = attachment.contentType?.startsWith('image/');
  const altText = attachment.name ?? 'File attachment';
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const isBlob = attachment.url.startsWith('blob:');

  useEffect(() => {
    // Check for duplicates immediately and prevent upload
    if (isDuplicate(attachment, existingAttachments)) {
      toast.error(`Duplicate file: ${altText}`, {
        description: "This file has already been uploaded",
        duration: 3000,
      });
      if (onRemove) {
        onRemove(attachment.url);
      }
      return;
    }
  }, [attachment, existingAttachments, altText, onRemove]);

  // If it's a duplicate, don't render anything
  if (isDuplicate(attachment, existingAttachments)) {
    return null;
  }

  const handleImageError = () => {
    setImageError(true);
    console.error(`Failed to load image: ${attachment.url}`);
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const renderImage = () => {
    if (imageError || isBlob) {
      return (
        <img 
          src={isBlob ? attachment.url : '/placeholder-image.png'}
          alt={altText}
          className={cn(
            "h-full w-full object-cover max-h-[300px]",
            !isImageLoaded && "opacity-0"
          )}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      );
    }

    return (
      <div className="relative h-full w-full max-h-[300px]">
        <Image
          src={attachment.url}
          alt={altText}
          className={cn(
            "object-cover",
            !isImageLoaded && "opacity-0"
          )}
          fill
          sizes="200px"
          onError={handleImageError}
          onLoadingComplete={handleImageLoad}
          unoptimized={attachment.url.includes('vercel-storage.com')}
        />
      </div>
    );
  };

  return (
    <div className="relative group overflow-hidden mr-2 mb-2 last:mr-0">
      <div className={cn(
        "relative h-20 w-20 border rounded-lg overflow-hidden",
        !isImageLoaded && "bg-muted animate-pulse",
        isUploading && "opacity-70"
      )}>
        {isImage && !imageError ? (
          renderImage()
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        
        {isUploading && isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {onRemove && !isUploading && (
          <button
            onClick={() => onRemove(attachment.url)}
            className="absolute right-0.5 top-0.5 rounded-full bg-rose-500/90 p-0.5 text-white shadow-sm hover:bg-rose-600 transition"
            aria-label={`Remove ${altText}`}
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>

      {!isUploading && isImageLoaded && (
        <div className="mt-1 truncate text-center text-xs text-muted-foreground max-w-[200px]">
          {altText}
        </div>
      )}
    </div>
  );
}
