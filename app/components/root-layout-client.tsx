"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "./sidebar";

interface User {
  id: string;
  email?: string;
}

interface RootLayoutClientProps {
  children: React.ReactNode;
  user: User | null;
}

export function RootLayoutClient({ children, user: initialUser }: RootLayoutClientProps) {
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
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 