'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

export const Tabs        = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex items-center gap-1 rounded-xl bg-ink-800 p-1.5 border border-white/6',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium',
        'text-slate-500 transition-all duration-150',
        'hover:text-slate-300',
        'data-[state=active]:bg-ink-600 data-[state=active]:text-slate-100 data-[state=active]:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

/* ─── Underline variant ─────────────────────────────────────────── */
export function TabsUnderlineList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-0 border-b border-ink-600', className)}
      {...props}
    />
  )
}

export function TabsUnderlineTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors',
        'hover:text-slate-300',
        'data-[state=active]:text-slate-100',
        'data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-brand-500 data-[state=active]:after:rounded-t-full',
        'focus-visible:outline-none',
        className
      )}
      {...props}
    />
  )
}
