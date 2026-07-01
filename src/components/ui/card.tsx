'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'

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

/* ─── StatCard ─────────────────────────────────────────────────── */
export interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  trend?: { value: number; label?: string }
  variant?: 'default' | 'income' | 'expense' | 'gold' | 'info'
  className?: string
}

export function StatCard({ label, value, sub, icon, trend, variant = 'default', className }: StatCardProps) {
  const { theme } = useDashboardTheme()
  const isPositive = trend && trend.value >= 0

  const variantStyles = {
    default: 'bg-ink-700 border-white/6',
    income:  'bg-success-subtle border-success/20',
    expense: 'bg-danger-subtle border-danger/20',
    gold:    'bg-gold-900 border-gold-500/20',
    info:    'bg-cyan-950/40 border-cyan-500/20',
  }

  // Light theme: flat pastel card + colored icon chip already carry the
  // accent, so the value stays dark/neutral for a calmer read. Dark mode
  // keeps its original per-variant colored value untouched.
  const valueStyles = theme === 'light' ? {
    default: 'text-slate-100',
    income:  'text-slate-100',
    expense: 'text-slate-100',
    gold:    'text-slate-100',
    info:    'text-slate-100',
  } : {
    default: 'text-slate-100',
    income:  'text-success',
    expense: 'text-danger',
    gold:    'text-gold-400',
    info:    'text-cyan-300',
  }

  // Colored icon chip is a light-theme-only treatment — dark mode keeps its
  // original neutral chip untouched (never change dark mode's look).
  const iconChipStyles = theme === 'light' ? {
    default: 'bg-brand-500 text-white',
    income:  'bg-success text-white',
    expense: 'bg-danger text-white',
    gold:    'bg-gold-500 text-slate-900',
    info:    'bg-cyan-500 text-white',
  } : {
    default: 'bg-ink-600/50 text-slate-400',
    income:  'bg-ink-600/50 text-slate-400',
    expense: 'bg-ink-600/50 text-slate-400',
    gold:    'bg-ink-600/50 text-slate-400',
    info:    'bg-ink-600/50 text-slate-400',
  }

  return (
    <div className={cn('rounded-xl border p-5 flex flex-col gap-3', variantStyles[variant], className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={cn('size-8 rounded-lg flex items-center justify-center', iconChipStyles[variant])}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={cn('text-xl sm:text-2xl font-bold leading-none tracking-tight', valueStyles[variant])}>
          {value}
        </span>
        {trend && (
          <span className={cn('max-sm:hidden text-xs font-medium shrink-0', isPositive ? 'text-success' : 'text-danger')}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            {trend.label && <span className="text-slate-500 ml-1">{trend.label}</span>}
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  )
}
