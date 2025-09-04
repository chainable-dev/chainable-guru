import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 
      className={cn("animate-spin", sizeClasses[size], className)} 
    />
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = "Loading...", 
  className,
  disabled 
}: LoadingButtonProps) {
  return (
    <button 
      type="button"
      className={cn("flex items-center gap-2", className)}
      disabled={isLoading || disabled}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      {isLoading ? loadingText : children}
    </button>
  );
}

interface LoadingCardProps {
  className?: string;
  lines?: number;
}

export function LoadingCard({ className, lines = 3 }: LoadingCardProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={`loading-line-${i}`} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

interface LoadingMessageProps {
  className?: string;
}

export function LoadingMessage({ className }: LoadingMessageProps) {
  return (
    <div className={cn("flex items-center gap-3 p-4", className)}>
      <LoadingSpinner size="sm" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

interface LoadingChatListProps {
  count?: number;
  className?: string;
}

export function LoadingChatList({ count = 5, className }: LoadingChatListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`loading-chat-${i}`} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface LoadingDocumentProps {
  className?: string;
}

export function LoadingDocument({ className }: LoadingDocumentProps) {
  return (
    <div className={cn("space-y-4 p-6", className)}>
      <Skeleton className="h-8 w-2/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ isLoading, children, className }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LoadingState({ 
  isLoading, 
  children, 
  fallback,
  className 
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {fallback || <LoadingCard />}
      </div>
    );
  }

  return <>{children}</>;
}
