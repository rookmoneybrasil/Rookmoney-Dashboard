'use client'

import { Crown, X, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  usage:  { transactionsThisMonth: number; bills: number; goals: number }
  limits: { transactionsPerMonth: number | null; bills: number | null; goals: number | null }
}

function nearLimit(used: number, limit: number | null) {
  return limit !== null && used / limit >= 0.8
}
function atLimit(used: number, limit: number | null) {
  return limit !== null && used >= limit
}

export function LimitBanner({ usage, limits }: Props) {
  const t = useTranslations('limitBanner')
  const c = useTranslations('common')
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const txNear   = nearLimit(usage.transactionsThisMonth, limits.transactionsPerMonth)
  const billNear = nearLimit(usage.bills, limits.bills)
  const goalNear = nearLimit(usage.goals, limits.goals)
  const txFull   = atLimit(usage.transactionsThisMonth, limits.transactionsPerMonth)
  const billFull = atLimit(usage.bills, limits.bills)
  const goalFull = atLimit(usage.goals, limits.goals)

  if (!txNear && !billNear && !goalNear) return null

  const isAtLimit = txFull || billFull || goalFull
  const messages: string[] = []
  if (txNear && limits.transactionsPerMonth)   messages.push(`${usage.transactionsThisMonth}/${limits.transactionsPerMonth} ${c('transactions')}`)
  if (billNear && limits.bills)                messages.push(`${usage.bills}/${limits.bills} ${c('bills')}`)
  if (goalNear && limits.goals)                messages.push(`${usage.goals}/${limits.goals} ${c('goals')}`)

  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
      isAtLimit
        ? 'bg-danger/10 border-danger/25 text-danger'
        : 'bg-amber-400/10 border-amber-400/25'
    }`}>
      {isAtLimit
        ? <Crown className="size-4 text-danger shrink-0 fill-danger/20" />
        : <Zap    className="size-4 text-amber-400 shrink-0" />
      }
      <p className={`flex-1 text-sm ${isAtLimit ? 'text-danger' : 'text-amber-200'}`}>
        <span className="font-semibold">
          {isAtLimit ? t('atLimit') : t('nearLimit')}
        </span>{' '}
        {messages.join(' · ')}.
      </p>
      <Link
        href="/billing"
        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-colors ${
          isAtLimit
            ? 'bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30'
            : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30'
        }`}
      >
        <Crown className="size-3" />
        {t('upgradeBtn')}
        <ArrowRight className="size-3" />
      </Link>
      <button onClick={() => setDismissed(true)}
        className={`shrink-0 transition-colors ${isAtLimit ? 'text-danger/60 hover:text-danger' : 'text-amber-400/60 hover:text-amber-400'}`}>
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
        <Link href="/billing" className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 font-medium">
          <Crown className="size-3 fill-amber-400" />
          PRO
        </Link>
      )}
    </div>
  )
}
