'use client'

import { Crown } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md'
}

export function ProBadge({ size = 'sm' }: Props) {
  if (size === 'md') {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide">
        <Crown className="size-3 fill-amber-400" />
        PRO
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-400 px-1.5 py-px rounded-full text-[10px] font-bold tracking-wide leading-none">
      <Crown className="size-2.5 fill-amber-400" />
      PRO
    </span>
  )
}
