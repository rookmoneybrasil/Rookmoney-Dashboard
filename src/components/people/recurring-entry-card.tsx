'use client'

import { useState } from 'react'
import { RefreshCw, X, AlertTriangle } from 'lucide-react'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

interface Props { item: PersonEntryRecurringItem }

export function RecurringEntryCard({ item }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [pending,    setPending]    = useState(false)

  async function handleStop() {
    setPending(true)
    await clientApi.stopPersonRecurring(item.id)
    window.location.reload()
  }

  const isTheyOwe = item.type === 'THEY_OWE_ME'

  return (
    <div className="flex items-center gap-3 p-3.5 bg-brand-900/20 border border-brand-700/30 rounded-xl">
      <div className="size-8 rounded-lg bg-brand-800/60 flex items-center justify-center shrink-0">
        <RefreshCw className="size-3.5 text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{item.description}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className={isTheyOwe ? 'text-success' : 'text-danger'}>
            {isTheyOwe ? '+' : '-'}{formatCurrency(item.amount)}/mês
          </span>
          {' '}· todo dia {item.dayOfMonth}
          {item.category && ` · ${item.category.icon} ${item.category.name}`}
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <AlertTriangle className="size-3 text-warning" />
            Parar?
          </span>
          <button onClick={handleStop} disabled={pending}
            className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20 disabled:opacity-50">
            {pending ? '...' : 'Sim'}
          </button>
          <button onClick={() => setConfirming(false)}
            className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200">
            Não
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)}
          className="shrink-0 text-xs text-slate-600 hover:text-danger transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-danger/10">
          <X className="size-3" />
          Parar
        </button>
      )}
    </div>
  )
}
