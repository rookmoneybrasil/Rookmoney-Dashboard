import * as React from 'react'
import Image from 'next/image'
import { cn, getInitials } from '@/lib/utils'

export interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-16 text-lg',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full overflow-hidden',
        'bg-gradient-to-br from-brand-600 to-brand-800 font-semibold text-white select-none',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} fill className="object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

/* ─── AvatarGroup ───────────────────────────────────────────────── */
export interface AvatarGroupProps {
  avatars: { src?: string; name?: string }[]
  max?: number
  size?: AvatarProps['size']
  className?: string
}

export function AvatarGroup({ avatars, max = 4, size = 'sm', className }: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const overflow = avatars.length - max

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          name={av.name}
          size={size}
          className="ring-2 ring-ink-800"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full bg-ink-600 text-slate-400 font-medium ring-2 ring-ink-800',
            sizeMap[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
