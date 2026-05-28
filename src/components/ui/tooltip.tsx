'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip         = TooltipPrimitive.Root
export const TooltipTrigger  = TooltipPrimitive.Trigger

export function TooltipContent({
  className,
  sideOffset = 6,
  side = 'top',
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        side={side}
        className={cn(
          'z-50 overflow-hidden rounded-lg bg-ink-600 border border-white/10 px-3 py-1.5',
          'text-xs font-medium text-slate-200 shadow-[0_4px_16px_rgba(3,7,16,0.6)]',
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
}

/* ─── Convenience wrapper ───────────────────────────────────────── */
export function WithTooltip({
  content,
  children,
  side,
  delayDuration = 400,
}: {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delayDuration?: number
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
