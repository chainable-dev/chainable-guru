import { headers } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { AppSidebarClient } from "./app-sidebar-client";

export async function AppSidebarServer() {
  // This ensures this component is rendered on the server
  headers();
  
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return <AppSidebarClient initialUser={session?.user || null} />;
} 