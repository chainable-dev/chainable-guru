'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { useState } from 'react'

export function SettingsDialog() {
  const { webSearch, attachments, setWebSearch, setAttachments } = useSettingsStore()
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your chat experience. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="web-search" className="flex flex-col gap-1">
              <span>Web Search</span>
              <span className="font-normal text-muted-foreground text-sm">
                Enable web search capabilities
              </span>
            </Label>
            <Switch
              id="web-search"
              checked={webSearch}
              onCheckedChange={setWebSearch}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="attachments" className="flex flex-col gap-1">
              <span>Attachments</span>
              <span className="font-normal text-muted-foreground text-sm">
                Enable file attachments in chat
              </span>
            </Label>
            <Switch
              id="attachments"
              checked={attachments}
              onCheckedChange={setAttachments}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 