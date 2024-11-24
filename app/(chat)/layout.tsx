import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";

import { AppSidebar } from "@/components/custom/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createServerClient } from "@/lib/supabase/server";

interface AppSidebarProps {
	user: User | null;
}

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

	const { user } = await createServerClient();

	return (
		<SidebarProvider defaultOpen={!isCollapsed}>
			<AppSidebar user={user} />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
