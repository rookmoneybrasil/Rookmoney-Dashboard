'use client'

import { Crown, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Props {
  usage:  { transactionsThisMonth: number; bills: number; goals: number }
  limits: { transactionsPerMonth: number | null; bills: number | null; goals: number | null }
}

function nearLimit(used: number, limit: number | null) {
  return limit !== null && used / limit >= 0.8
}

export function LimitBanner({ usage, limits }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const txNear   = nearLimit(usage.transactionsThisMonth, limits.transactionsPerMonth)
  const billNear = nearLimit(usage.bills, limits.bills)
  const goalNear = nearLimit(usage.goals, limits.goals)

  if (!txNear && !billNear && !goalNear) return null

  const messages: string[] = []
  if (txNear && limits.transactionsPerMonth) messages.push(`${usage.transactionsThisMonth}/${limits.transactionsPerMonth} transações`)
  if (billNear && limits.bills)              messages.push(`${usage.bills}/${limits.bills} contas`)
  if (goalNear && limits.goals)              messages.push(`${usage.goals}/${limits.goals} metas`)

  return (
    <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/25 rounded-xl px-4 py-3">
      <Zap className="size-4 text-amber-400 shrink-0" />
      <p className="flex-1 text-sm text-amber-200">
        <span className="font-semibold">Quase no limite do plano Free:</span>{' '}
        {messages.join(' · ')}.{' '}
        <Link href="/settings?tab=billing" className="underline underline-offset-2 hover:text-amber-100 transition-colors font-medium">
          Upgrade para PRO
        </Link>
      </p>
      <button onClick={() => setDismissed(true)} className="text-amber-400/60 hover:text-amber-400 transition-colors shrink-0">
        <X className="size-4" />
      </button>
    </div>
  )
}

export function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  if (limit === null) return null
  const pct   = Math.min(Math.round((used / limit) * 100), 100)
  const color = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-amber-400' : 'bg-brand-500'

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span className="shrink-0 w-16 text-right">{label}</span>
      <div className="w-20 h-1.5 bg-ink-600 rounded-full overflow-hidden">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={pct >= 80 ? 'text-amber-400 font-medium' : 'tabular-nums'}>{used}/{limit}</span>
      {pct >= 100 && (
        <Link href="/settings?tab=billing" className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium">
          <Crown className="size-3 fill-amber-400" />
          PRO
        </Link>
      )}
    </div>
  )
}
