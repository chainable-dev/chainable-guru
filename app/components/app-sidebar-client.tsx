"use client";

import { useState, useEffect } from "react";
import { SidebarContent, SidebarHeader, SidebarSeparator } from "@/components/ui/sidebar";
import { ChatHistory } from "./chat-history";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email?: string;
}

interface AppSidebarClientProps {
  initialUser: User | null;
}

export function AppSidebarClient({ initialUser }: AppSidebarClientProps) {
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const supabase = createClient();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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