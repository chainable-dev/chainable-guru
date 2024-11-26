import { headers } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatLayoutClient } from "./chat-layout-client";

interface ChatLayoutProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export async function ChatLayout({ children, defaultOpen = true }: ChatLayoutProps) {
  // This ensures this component is rendered on the server
  headers();
  
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <ChatLayoutClient user={session?.user || null}>
        {children}
      </ChatLayoutClient>
    </SidebarProvider>
  );
} 