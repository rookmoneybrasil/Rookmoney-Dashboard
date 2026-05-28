'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Dropdown        = DropdownMenuPrimitive.Root
export const DropdownTrigger = DropdownMenuPrimitive.Trigger
export const DropdownGroup   = DropdownMenuPrimitive.Group
export const DropdownSub     = DropdownMenuPrimitive.Sub

export function DropdownContent({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-50 min-w-[180px] rounded-xl bg-ink-700 border border-white/8 p-1.5 shadow-[0_8px_32px_rgba(3,7,16,0.7)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownItem({
  className,
  inset,
  destructive,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  destructive?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive
          ? 'text-danger hover:bg-danger/10 focus:bg-danger/10'
          : 'text-slate-300 hover:bg-ink-600 hover:text-slate-100 focus:bg-ink-600 focus:text-slate-100',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  )
}

export function DropdownLabel({
  className,
  inset,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider', inset && 'pl-8', className)}
      {...props}
    />
  )
}

export function DropdownSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('-mx-1 my-1.5 h-px bg-white/6', className)}
      {...props}
    />
  )
}

export function DropdownCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-slate-300 outline-none transition-colors hover:bg-ink-600 hover:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}
