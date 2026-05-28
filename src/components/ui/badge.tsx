import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-ink-600 text-slate-300 border border-white/8',
        brand:       'bg-brand-800 text-brand-300 border border-brand-700',
        success:     'bg-success-subtle text-success border border-success/25',
        danger:      'bg-danger-subtle text-danger border border-danger/25',
        warning:     'bg-warning-subtle text-warning border border-warning/25',
        gold:        'bg-gold-900 text-gold-400 border border-gold-500/25',
        income:      'bg-success-subtle text-success',
        expense:     'bg-danger-subtle text-danger',
        outline:     'bg-transparent border border-ink-500 text-slate-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('size-1.5 rounded-full flex-shrink-0', {
            'bg-slate-400':   !variant || variant === 'default',
            'bg-brand-400':   variant === 'brand',
            'bg-success':     variant === 'success' || variant === 'income',
            'bg-danger':      variant === 'danger'  || variant === 'expense',
            'bg-warning':     variant === 'warning',
            'bg-gold-400':    variant === 'gold',
          })}
        />
      )}
      {children}
    </span>
  )
}
