"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Trash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HistoryItemProps {
  id: string;
  title: string;
  createdAt: string;
  onDelete: () => void;
}

export function HistoryItem({ id, title, createdAt, onDelete }: HistoryItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/chat/${id}`;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      onDelete();
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  return (
    <Link
      href={`/chat/${id}`}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-muted/50',
        isActive && 'bg-muted'
      )}
    >
      <MessageSquare className="h-4 w-4 shrink-0" />
      <div className="flex-1 truncate">
        <p className="truncate font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100"
        onClick={handleDelete}
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
    </Link>
  );
} 