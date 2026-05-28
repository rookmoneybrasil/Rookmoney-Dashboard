'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

/* ─── Label ─────────────────────────────────────────────────────── */
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
))
Label.displayName = 'Label'

/* ─── Input ─────────────────────────────────────────────────────── */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, type, ...props }, ref) => {
    return (
      <div className="relative flex flex-col gap-1.5">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'peer h-10 w-full rounded-lg bg-ink-800 border text-sm text-slate-100 placeholder:text-slate-600',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-danger/60 focus:ring-danger/30 focus:border-danger'
              : 'border-ink-500 hover:border-ink-400',
            leftIcon  ? 'pl-9'  : 'px-3',
            rightIcon ? 'pr-9'  : 'pr-3',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </div>
        )}
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

/* ─── Textarea ──────────────────────────────────────────────────── */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          ref={ref}
          className={cn(
            'w-full min-h-[80px] rounded-lg bg-ink-800 border px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 resize-y',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-danger/60 focus:ring-danger/30 focus:border-danger'
              : 'border-ink-500 hover:border-ink-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

/* ─── FormField ─────────────────────────────────────────────────── */
export interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({ label, htmlFor, error, hint, required, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
