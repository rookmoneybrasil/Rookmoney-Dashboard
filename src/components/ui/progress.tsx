'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'

/* ─── Progress ──────────────────────────────────────────────────── */
export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  max?: number
  variant?: 'brand' | 'success' | 'danger' | 'warning' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export function Progress({
  className,
  value = 0,
  max = 100,
  variant = 'brand',
  size = 'md',
  showLabel = false,
  label,
  ...props
}: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  const trackStyles = 'bg-ink-600 overflow-hidden rounded-full'
  const sizeStyles = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  const fillStyles = {
    brand:   'bg-brand-500',
    success: 'bg-success',
    danger:  'bg-danger',
    warning: 'bg-warning',
    gold:    'bg-gold-500',
  }

  return (
    <div className="flex flex-col gap-1.5">
      {(showLabel || label) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-slate-300">{pct}%</span>}
        </div>
      )}
      <ProgressPrimitive.Root
        className={cn(trackStyles, sizeStyles[size], className)}
        value={pct}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillStyles[variant])}
          style={{ width: `${pct}%` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

/* ─── CircularProgress ──────────────────────────────────────────── */
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: 'brand' | 'success' | 'gold' | 'danger'
  children?: React.ReactNode
  className?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 6,
  variant = 'brand',
  children,
  className,
}: CircularProgressProps) {
  const { theme } = useDashboardTheme()
  const pct = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference
  const trackColor = theme === 'light' ? 'rgba(30,58,138,0.10)' : 'rgba(255,255,255,0.06)'

  const strokeColors = {
    brand:   '#3B82F6',
    success: '#22C55E',
    gold:    '#F59E0B',
    danger:  '#F43F5E',
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
