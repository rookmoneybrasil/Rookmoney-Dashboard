'use client'

import { useState } from 'react'
import { RefreshCw, X, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringModal } from './edit-recurring-modal'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  item:           PersonEntryRecurringItem
  categories?:    Category[]
  monthEntryId?:  string | null
  paidThisMonth?: boolean
}

export function RecurringEntryCard({ item, categories = [], monthEntryId = null, paidThisMonth = false }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [stopping,   setStopping]   = useState(false)
  const [paid,       setPaid]       = useState(paidThisMonth)
  const [marking,    setMarking]    = useState(false)

  const isTheyOwe = item.type === 'THEY_OWE_ME'

  async function handleStop() {
    setStopping(true)
    await clientApi.stopPersonRecurring(item.id)
    window.location.reload()
  }

  async function handleTogglePaid() {
    setMarking(true)
    try {
      if (paid) {
        // Undo: unsettle the existing entry
        if (monthEntryId) {
          await clientApi.unsettleEntry(monthEntryId)
          setPaid(false)
          window.location.reload()
        }
      } else {
        if (monthEntryId) {
          // Settle the already-generated entry for this month
          await clientApi.settleEntry(monthEntryId)
        } else {
          // No entry generated yet — create and settle in one go
          const entry = await clientApi.createEntry(item.personId, {
            type:        item.type,
            description: item.description,
            amount:      item.amount,
            date:        new Date().toISOString().split('T')[0],
            categoryId:  item.categoryId,
          })
          await clientApi.settleEntry(entry.id)
        }
        setPaid(true)
        window.location.reload()
      }
    } catch {
      setMarking(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      paid ? 'bg-success/5 border-success/20' : 'bg-brand-900/20 border-brand-700/30'
    }`}>
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${paid ? 'bg-success/15' : 'bg-brand-800/60'}`}>
        {paid
          ? <CheckCircle2 className="size-3.5 text-success" />
          : <RefreshCw    className="size-3.5 text-brand-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${paid ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {item.description}
          </p>
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
        {!confirming && <EditRecurringModal item={item} categories={categories} />}

        {!confirming && (
          <button
            onClick={handleTogglePaid}
            disabled={marking}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors disabled:opacity-50 ${
              paid
                ? 'text-slate-500 hover:text-slate-300 hover:bg-ink-700'
                : 'text-success hover:bg-success/10'
            }`}
          >
            <Circle className="size-3.5" />
            {marking ? '...' : paid ? 'Desfazer' : 'Registrar mês'}
          </button>
        )}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-slate-600 hover:text-danger transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-danger/10"
          >
            <X className="size-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <AlertTriangle className="size-3 text-warning" /> Parar?
            </span>
            <button onClick={handleStop} disabled={stopping}
              className="h-6 px-2 rounded text-xs bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20 disabled:opacity-50">
              {stopping ? '...' : 'Sim'}
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
