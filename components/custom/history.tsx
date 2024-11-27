"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HistoryItem } from "./history-item";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export function History() {
  const router = useRouter();
  const { data: history, error, mutate } = useSWR('/api/history', fetcher);

  const handleClearHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear history');

      await mutate();
      toast.success('History cleared');
      router.push('/');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  }, [mutate, router]);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load history</p>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <h2 className="flex-1 font-semibold">History</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-xs"
        >
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-4">
              No history yet
            </p>
          ) : (
            history.map((item: any) => (
              <HistoryItem
                key={item.id}
                id={item.id}
                title={item.title}
                createdAt={item.created_at}
                onDelete={mutate}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 