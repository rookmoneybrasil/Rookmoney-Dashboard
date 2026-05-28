'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select        = SelectPrimitive.Root
export const SelectGroup   = SelectPrimitive.Group
export const SelectValue   = SelectPrimitive.Value

export function SelectTrigger({
  className,
  children,
  error,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { error?: boolean }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-ink-800 border px-3 text-sm text-slate-100',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:line-clamp-1',
        error
          ? 'border-danger/60'
          : 'border-ink-500 hover:border-ink-400',
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 text-slate-500 shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-xl bg-ink-700 border border-white/8 shadow-[0_8px_32px_rgba(3,7,16,0.7)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          position === 'popper' && 'data-[side=bottom]:translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center py-1 text-slate-500">
          <ChevronUp className="size-4" />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={cn('p-1.5', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center py-1 text-slate-500">
          <ChevronDown className="size-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider', className)}
      {...props}
    />
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-slate-300 outline-none',
        'focus:bg-ink-600 focus:text-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'transition-colors',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-brand-400" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn('-mx-1 my-1 h-px bg-white/6', className)} {...props} />
}
