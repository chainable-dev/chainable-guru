"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

interface TestInterfaceProps {
  onTaskSubmit?: () => void
}

export function TestInterface({ onTaskSubmit }: TestInterfaceProps) {
  const [taskDuration, setTaskDuration] = useState(5)
  const [shouldFail, setShouldFail] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/tasks/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: taskDuration,
          shouldFail,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create test task")
      }

      toast.success("Test task created successfully")
      onTaskSubmit?.()
    } catch (error) {
      console.error("Error creating test task:", error)
      toast.error("Failed to create test task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Interface</CardTitle>
        <CardDescription>Create test tasks to verify the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Task Duration (seconds)</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[taskDuration]}
              onValueChange={([value]) => setTaskDuration(value)}
              min={1}
              max={30}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={taskDuration}
              onChange={(e) => setTaskDuration(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="shouldFail"
            checked={shouldFail}
            onChange={(e) => setShouldFail(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="shouldFail">Simulate task failure</Label>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating Task..." : "Create Test Task"}
        </Button>
      </CardContent>
    </Card>
  )
} 