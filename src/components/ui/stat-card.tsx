'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'

/* ─── StatCard ─────────────────────────────────────────────────── */
// Split out from card.tsx: this is the only Card-family component that
// needs the theme hook, and 'use client' on the shared card.tsx forced
// every other page using plain Card/CardHeader/CardTitle/etc (14 of the
// 15 files importing from there) into client-side rendering for no
// reason — a real bundle-size/hydration regression traced back to a
// slowness report.
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
