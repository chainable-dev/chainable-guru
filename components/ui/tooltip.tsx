"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-40 overflow-hidden rounded-md px-2.5 py-1.5 text-xs",
      "bg-gray-900/95 text-gray-100",
      "shadow-xl",
      "animate-in fade-in-0 zoom-in-95 duration-100",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1",
      "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

interface BetterTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

function BetterTooltip({ 
  content, 
  children, 
  align = "center", 
  side = "bottom",
  className 
}: BetterTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent 
        align={align} 
        side={side} 
        className={className}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  BetterTooltip 
}
