'use client'

import { Button } from '@/components/ui/button'
import { BetterTooltip } from '@/components/ui/tooltip'
import { Menu } from 'lucide-react'
import { useSidebar } from '@/hooks/use-sidebar'

export function SidebarToggle() {
	const { toggle } = useSidebar()

	return (
		<BetterTooltip
			content="Toggle sidebar"
			side="right"
		>
			<Button
				variant="ghost"
				size="icon"
				onClick={toggle}
				className="md:hidden"
			>
				<Menu className="h-4 w-4" />
			</Button>
		</BetterTooltip>
	)
}
