"use client";

import { useRouter } from "next/navigation";
import { useWindowSize } from "usehooks-ts";

import { ModelSelector } from "@/components/custom/model-selector";
import { SidebarToggle } from "@/components/custom/sidebar-toggle";
import { SettingsDialog } from "@/components/custom/settings-dialog";
import { Button } from "@/components/ui/button";
import { BetterTooltip } from "@/components/ui/tooltip";
import { toast } from "sonner";

import { PlusIcon, HistoryIcon, SettingsIcon } from "./icons";
import { useSidebar } from "../ui/sidebar";

export function ChatHeader({ selectedModelId }: { selectedModelId: string }) {
	const router = useRouter();
	const { open, toggle } = useSidebar();
	const { width: windowWidth } = useWindowSize();
	const isMobile = windowWidth < 768;

	const handleNewChat = () => {
		router.push("/");
		router.refresh();
		toast.success("Started new chat");
	};

	const handleHistory = () => {
		if (isMobile) {
			toggle();
		}
		router.push("/history");
	};

	return (
		<header className="sticky top-0 z-50 flex items-center gap-2 border-b bg-background px-2 py-1.5">
			<SidebarToggle />
			
			{(!open || isMobile) && (
				<BetterTooltip content="New Chat">
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9"
						onClick={handleNewChat}
					>
						<PlusIcon className="h-4 w-4" />
						<span className="sr-only">New Chat</span>
					</Button>
				</BetterTooltip>
			)}
			
			<ModelSelector
				selectedModelId={selectedModelId}
				className="w-[180px]"
			/>

			<div className="ml-auto flex items-center gap-2">
				{!open && (
					<BetterTooltip content="History">
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9"
							onClick={handleHistory}
						>
							<HistoryIcon className="h-4 w-4" />
							<span className="sr-only">History</span>
						</Button>
					</BetterTooltip>
				)}
				<SettingsDialog />
			</div>
		</header>
	);
}
