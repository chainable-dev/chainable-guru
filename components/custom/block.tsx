import { BetterTooltip } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

export function InfoBlock({ title, description }: { title: string; description: string }) {
	return (
		<div className="flex items-center gap-2">
			<h3 className="font-medium">{title}</h3>
			<BetterTooltip 
				content={description}
				side="right"
				align="center"
			>
				<Button variant="ghost" size="icon" className="h-4 w-4 p-0">
					<Info className="h-3 w-3" />
				</Button>
			</BetterTooltip>
		</div>
	)
}
