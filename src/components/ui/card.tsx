import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Card ──────────────────────────────────────────────────────── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl transition-colors',
        {
          default:  'bg-ink-700 border border-white/6',
          elevated: 'bg-ink-600 border border-white/8 shadow-[0_4px_24px_rgba(3,7,16,0.5)]',
          outline:  'bg-transparent border border-ink-500',
          glass:    'glass',
        }[variant],
        {
          none: '',
          sm:   'p-3',
          md:   'p-5',
          lg:   'p-6',
        }[padding],
        className
      )}
      {...props}
    />
  )
}

/* ─── CardHeader ───────────────────────────────────────────────── */
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 pb-4', className)} {...props} />
}

/* ─── CardTitle ────────────────────────────────────────────────── */
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-slate-100 leading-tight', className)}
      {...props}
    />
  )
}

/* ─── CardDescription ──────────────────────────────────────────── */
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-500 leading-relaxed', className)} {...props} />
  )
}

/* ─── CardContent ──────────────────────────────────────────────── */
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

/* ─── CardFooter ───────────────────────────────────────────────── */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-white/6', className)}
      {...props}
    />
  )
}

// StatCard lives in ./stat-card.tsx — it's the only Card-family component
// that needs the dashboard theme hook, so it gets its own 'use client'
// boundary instead of forcing this whole file (Card/CardHeader/etc, used
// as plain server-rendered wrappers in most places) to be client-only.
