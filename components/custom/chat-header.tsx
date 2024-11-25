"use client";

import { useRouter } from 'next/navigation'
import { useWindowSize } from '@/hooks/use-window-size'
import { useSidebar } from '@/hooks/use-sidebar'
import { SidebarToggle } from './sidebar-toggle'
import { BetterTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Bot, Info } from 'lucide-react'

interface ChatHeaderProps {
	selectedModelId: string
}

export function ChatHeader({ selectedModelId }: ChatHeaderProps) {
	const router = useRouter()
	const { isOpen } = useSidebar()
	const { width: windowWidth } = useWindowSize()

	return (
		<div className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-2 border-b">
			<div className="flex items-center gap-2">
				<SidebarToggle />
				{(!isOpen || windowWidth < 768) && (
					<BetterTooltip
						content="AI Chat"
						side="right"
					>
						<Button 
							variant="ghost" 
							size="icon"
							onClick={() => router.push('/')}
						>
							<Bot className="h-5 w-5" />
						</Button>
					</BetterTooltip>
				)}
			</div>

			<div className="flex items-center gap-2">
				<BetterTooltip
					content={`Using ${selectedModelId} model`}
					side="left"
				>
					<Button variant="ghost" size="icon">
						<Info className="h-4 w-4" />
					</Button>
				</BetterTooltip>
			</div>
		</div>
	)
}
