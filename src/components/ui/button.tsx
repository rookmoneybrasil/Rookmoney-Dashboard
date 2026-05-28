'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-brand-500 text-white hover:bg-brand-400 active:bg-brand-600 shadow-sm',
        secondary:
          'bg-ink-700 text-slate-200 hover:bg-ink-600 active:bg-ink-700 border border-white/8',
        outline:
          'border border-ink-500 text-slate-300 hover:bg-ink-700 hover:text-white active:bg-ink-600',
        ghost:
          'text-slate-400 hover:bg-ink-700 hover:text-slate-200 active:bg-ink-600',
        destructive:
          'bg-danger-subtle text-danger border border-danger/30 hover:bg-danger/15',
        gold:
          'bg-gold-500 text-ink-900 hover:bg-gold-400 active:bg-gold-600 font-semibold shadow-sm',
        link:
          'text-brand-400 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-8 px-3 text-xs rounded-md',
        md:   'h-10 px-4 text-sm',
        lg:   'h-11 px-6 text-sm',
        xl:   'h-12 px-8 text-base',
        icon: 'size-10 p-0',
        'icon-sm': 'size-8 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }
