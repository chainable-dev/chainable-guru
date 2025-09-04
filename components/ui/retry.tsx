import { useState } from "react";
import { Button } from "./button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RetryProps {
  onRetry: () => void | Promise<void>;
  error?: string;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function Retry({ onRetry, error, className, isLoading = false, children }: RetryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-4 p-6 text-center", className)}>
      <AlertCircle className="h-12 w-12 text-muted-foreground" />
      {children || (
        <>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            {error && (
              <p className="text-sm text-muted-foreground">{error}</p>
            )}
          </div>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying || isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", (isRetrying || isLoading) && "animate-spin")} />
            {isRetrying || isLoading ? "Retrying..." : "Try Again"}
          </Button>
        </>
      )}
    </div>
  );
}

interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function RetryButton({ onRetry, isLoading = false, className, children }: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button 
      onClick={handleRetry} 
      disabled={isRetrying || isLoading}
      variant="outline"
      size="sm"
      className={cn("flex items-center gap-2", className)}
    >
      <RefreshCw className={cn("h-4 w-4", (isRetrying || isLoading) && "animate-spin")} />
      {children || (isRetrying || isLoading ? "Retrying..." : "Retry")}
    </Button>
  );
}

interface ErrorBoundaryProps {
  error?: Error | null;
  onRetry?: () => void;
  fallback?: React.ReactNode;
  className?: string;
}

export function ErrorBoundary({ error, onRetry, fallback, className }: ErrorBoundaryProps) {
  if (!error) return null;

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Retry 
      onRetry={onRetry || (() => window.location.reload())}
      error={error.message}
      className={className}
    />
  );
}
