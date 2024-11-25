'use client'

import { Button } from '@/components/ui/button'
import { useSidebar } from './context'
import { Menu } from 'lucide-react'

export function SidebarToggle() {
  const { toggle } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="md:hidden"
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
} 