"use client";

import { useEffect, useState } from "react";
import { SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { ChatHistory } from "./chat-history";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email?: string;
}

export function AppSidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  return (
    <aside className="w-64 bg-background border-r">
      <SidebarHeader>
        <h1 className="text-lg font-semibold">Elron AI</h1>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {!isLoading && user && <ChatHistory userId={user.id} />}
      </SidebarContent>
    </aside>
  );
} 