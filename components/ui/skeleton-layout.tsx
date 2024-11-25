"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar Skeleton */}
      <div className="fixed left-0 z-40 flex h-full w-72 flex-col bg-muted/50 pt-16">
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-auto pl-72">
        <div className="container mx-auto max-w-3xl py-6">
          {/* Chat Messages Skeleton */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Input Skeleton */}
          <div className="fixed bottom-0 left-72 right-0 p-4">
            <div className="mx-auto max-w-3xl">
              <Skeleton className="h-[120px] w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 