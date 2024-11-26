"use client";

import { SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { ChatHistory } from "./chat-history";

interface User {
  id: string;
  email?: string;
}

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 bg-background border-r">
      <SidebarHeader>
        <h1 className="text-lg font-semibold">Elron AI</h1>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {user && <ChatHistory userId={user.id} />}
      </SidebarContent>
    </aside>
  );
} 