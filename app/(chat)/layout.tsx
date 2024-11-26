"use client";

import { AppSidebar } from "@/app/components/app-sidebar";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ChatLayoutProps {
	children: React.ReactNode;
	defaultOpen?: boolean;
}

export default function ChatLayout({
	children,
	defaultOpen = true,
}: ChatLayoutProps) {
	return (
		<TooltipProvider>
			<SidebarProvider defaultOpen={defaultOpen}>
				<div className="relative flex h-[100dvh] overflow-hidden bg-zinc-950">
					<Sidebar className="border-r border-zinc-800 bg-zinc-950">
						<AppSidebar />
					</Sidebar>
					<main className="flex-1 overflow-auto bg-zinc-950">
						<div className="flex h-full flex-col bg-zinc-950">
							{children}
						</div>
					</main>
				</div>
			</SidebarProvider>
		</TooltipProvider>
	);
}
