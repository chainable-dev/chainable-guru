import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface TaskCardProps {
  id: string
  title: string
  status: "running" | "completed" | "failed"
  progress: number
}

export function TaskCard({ id, title, status, progress }: TaskCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{title}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Task ID: {id}</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <Badge
          variant={
            status === "completed"
              ? "default"
              : status === "failed"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-muted-foreground">
          Task ID: {id}
        </div>
        <Progress
          value={progress}
          className="mt-2"
        />
      </CardContent>
    </Card>
  )
} 