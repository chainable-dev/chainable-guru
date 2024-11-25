export function MessageSkeleton() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="h-4 bg-muted rounded w-24 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
} 