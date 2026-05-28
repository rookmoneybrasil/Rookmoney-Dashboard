import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@/lib/utils'

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  label?: string
}

export function Separator({ className, orientation = 'horizontal', decorative = true, label, ...props }: SeparatorProps) {
  if (label) {
    return (
      <div className="flex items-center gap-3">
        <SeparatorPrimitive.Root
          className={cn('shrink-0 bg-ink-600', orientation === 'horizontal' ? 'h-px flex-1' : 'w-px h-full')}
          {...props}
        />
        <span className="text-xs text-slate-500 whitespace-nowrap">{label}</span>
        <SeparatorPrimitive.Root
          className={cn('shrink-0 bg-ink-600', orientation === 'horizontal' ? 'h-px flex-1' : 'w-px h-full')}
          {...props}
        />
      </div>
    )
  }

  return (
    <SeparatorPrimitive.Root
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-ink-600',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
}
