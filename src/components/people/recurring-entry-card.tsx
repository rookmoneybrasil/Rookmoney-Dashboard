'use client'

import { useState } from 'react'
import { RefreshCw, X, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

interface Props {
  item:        PersonEntryRecurringItem
  paidThisMonth?: boolean  // true se já foi marcado como pago neste mês
}

export function RecurringEntryCard({ item, paidThisMonth = false }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [pending,    setPending]    = useState(false)
  const [paid,       setPaid]       = useState(paidThisMonth)
  const [marking,    setMarking]    = useState(false)

  const isTheyOwe = item.type === 'THEY_OWE_ME'

  async function handleStop() {
    setPending(true)
    await clientApi.stopPersonRecurring(item.id)
    window.location.reload()
  }

  async function handleMarkPaid() {
    setMarking(true)
    try {
      // Create a settled entry for this month
      await clientApi.createEntry(item.personId, {
        type:        item.type,
        description: item.description,
        amount:      item.amount,
        date:        new Date().toISOString().split('T')[0],
        notes:       `Recorrente mensal — ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        categoryId:  item.categoryId,
      })
      // Mark as settled immediately
      setPaid(true)
      window.location.reload()
    } catch {
      setMarking(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      paid
        ? 'bg-success/5 border-success/20'
        : 'bg-brand-900/20 border-brand-700/30'
    }`}>
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${paid ? 'bg-success/15' : 'bg-brand-800/60'}`}>
        {paid
          ? <CheckCircle2 className="size-3.5 text-success" />
          : <RefreshCw className="size-3.5 text-brand-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${paid ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {item.description}
          </p>
          {/* Badge de status */}
          {paid
            ? <span className="text-[10px] bg-success/15 text-success border border-success/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pago</span>
            : <span className="text-[10px] bg-warning/15 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pendente</span>
          }
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className={isTheyOwe ? 'text-success' : 'text-danger'}>
            {isTheyOwe ? '+' : '-'}{formatCurrency(item.amount)}/mês
          </span>
          {' '}· dia {item.dayOfMonth}
          {item.category && ` · ${item.category.icon} ${item.category.name}`}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {/* Marcar pago / pendente */}
        {!paid && !confirming && (
          <button onClick={handleMarkPaid} disabled={marking}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-success hover:bg-success/10 transition-colors disabled:opacity-50">
            <Circle className="size-3.5" />
            {marking ? '...' : 'Pago'}
          </button>
        )}

        {/* Parar */}
        {!confirming ? (
          <button onClick={() => setConfirming(true)}
            className="text-xs text-slate-600 hover:text-danger transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-danger/10">
            <X className="size-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <AlertTriangle className="size-3 text-warning" /> Parar?
            </span>
            <button onClick={handleStop} disabled={pending}
              className="h-6 px-2 rounded text-xs bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20 disabled:opacity-50">
              {pending ? '...' : 'Sim'}
            </button>
            <button onClick={() => setConfirming(false)}
              className="h-6 px-2 rounded text-xs bg-ink-600 text-slate-400 hover:text-slate-200">
              Não
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
