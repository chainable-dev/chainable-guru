"use client";

import { SidebarInset } from "@/components/ui/sidebar";

interface ChatLayoutClientProps {
  children: React.ReactNode;
}

export function ChatLayoutClient({ children }: ChatLayoutClientProps) {
  return (
    <div className="flex min-h-screen">
      {children}
      <main className="flex-1">
        <SidebarInset>{children}</SidebarInset>
      </main>
    </div>
  );
} 