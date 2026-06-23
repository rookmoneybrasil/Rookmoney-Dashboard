'use client'

import { Crown, Sparkles } from 'lucide-react'
import { isProPlus } from '@/lib/plans'

interface Props {
  size?: 'sm' | 'md'
  plan?: string | null
}

export function ProBadge({ size = 'sm', plan }: Props) {
  const plus = isProPlus(plan)
  const label = plus ? 'PRO+' : 'PRO'

  if (size === 'md') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide border ${
        plus
          ? 'bg-gradient-to-r from-amber-400/15 to-orange-400/15 border-orange-400/30 text-orange-400'
          : 'bg-amber-400/15 border-amber-400/30 text-amber-400'
      }`}>
        {plus ? <Sparkles className="size-3" /> : <Crown className="size-3 fill-amber-400" />}
        {label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded-full text-[10px] font-bold tracking-wide leading-none border ${
      plus
        ? 'bg-gradient-to-r from-amber-400/15 to-orange-400/15 border-orange-400/30 text-orange-400'
        : 'bg-amber-400/15 border-amber-400/30 text-amber-400'
    }`}>
      {plus ? <Sparkles className="size-2.5" /> : <Crown className="size-2.5 fill-amber-400" />}
      {label}
    </span>
  )
}
