'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Modal       = DialogPrimitive.Root
export const ModalTrigger = DialogPrimitive.Trigger
export const ModalClose   = DialogPrimitive.Close

export function ModalPortal({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
}

export function ModalOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

export interface ModalContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showClose?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function ModalContent({ className, children, showClose = true, size = 'md', ...props }: ModalContentProps) {
  const sizeStyles = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full rounded-2xl bg-ink-800 border border-white/8 shadow-[0_8px_48px_rgba(3,7,16,0.8)]',
          'p-6 focus:outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
          'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50">
            <X className="size-4" />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </ModalPortal>
  )
}

export function ModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1 mb-5', className)} {...props} />
  )
}

export function ModalTitle({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-lg font-semibold text-slate-100 leading-tight', className)}
      {...props}
    />
  )
}

export function ModalDescription({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-slate-500', className)}
      {...props}
    />
  )
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-3 mt-6 pt-5 border-t border-white/6', className)}
      {...props}
    />
  )
}
