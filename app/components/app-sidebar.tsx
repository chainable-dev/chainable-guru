"use client";

import { useEffect, useState } from "react";
import { SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { ChatHistory } from "./chat-history";
import { createClient } from "@/lib/supabase/client";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email?: string;
}

export function AppSidebar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    setMounted(true);
    loadUser();
  }, []);

  const handleNewChat = () => {
    router.push("/");
    router.refresh();
  };

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return (
      <aside className="w-64 min-h-screen bg-sidebar-background border-r border-sidebar-border" suppressHydrationWarning>
        <SidebarHeader className="px-4 py-3 bg-sidebar-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-sidebar-primary" />
              <h1 className="text-lg font-semibold text-sidebar-foreground">Elron AI</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0"
              disabled
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarSeparator className="bg-sidebar-border" />
      </aside>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-sidebar-background border-r border-sidebar-border">
      <SidebarHeader className={cn(
        "px-4 py-3 bg-sidebar-background/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar-background/60",
        "sticky top-0 z-10"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sidebar-primary" />
            <h1 className="text-lg font-semibold text-sidebar-foreground">Elron AI</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            className={cn(
              "text-sidebar-accent-foreground hover:bg-sidebar-accent",
              "hover:text-sidebar-accent-foreground transition-colors"
            )}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New Chat</span>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="bg-sidebar-border" />
      <SidebarContent className="p-2">
        {user && <ChatHistory userId={user.id} />}
      </SidebarContent>
    </aside>
  );
} 