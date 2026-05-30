'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import { EntryActions } from './entry-actions'
import { EditEntryModal } from './edit-entry-modal'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { clientApi } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PersonEntryRow } from '@/lib/api-client'

type Category = { id: string; name: string; icon: string; color: string }

interface Props {
  personId:   string
  entries:    PersonEntryRow[]
  categories: Category[]
}

// Strip the " (X/Y)" suffix added automatically on creation
function baseDescription(description: string): string {
  return description.replace(/\s*\(\d+\/\d+\)$/, '')
}

export function InstallmentGroup({ personId, entries, categories }: Props) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  const first        = entries[0]
  const total        = first.installmentTotal ?? entries.length
  const isTheyOwe    = first.type === 'THEY_OWE_ME'
  const settledCount = entries.filter((e) => e.isSettled).length
  const remaining    = entries.filter((e) => !e.isSettled).length
  const name         = baseDescription(first.description)
  const perInst      = Number(first.amount)
  const totalAmount  = perInst * total
  const paidAmount   = perInst * settledCount
  const leftAmount   = totalAmount - paidAmount
  const nextDue      = entries.find((e) => !e.isSettled)
  const allSettled   = settledCount === total
  const pct          = Math.round((settledCount / total) * 100)

  return (
    <div className="rounded-xl border border-ink-700 overflow-hidden bg-ink-800">
      {/* Group header — clickable */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 hover:bg-ink-750 transition-colors text-left"
      >
        {/* Direction icon */}
        <div className={`size-9 rounded-lg shrink-0 flex items-center justify-center ${
          isTheyOwe ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {isTheyOwe ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm truncate">{name}</span>
            {/* Progress pill */}
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
              allSettled
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-brand-900/50 text-brand-400 border-brand-700/30'
            }`}>
              {settledCount}/{total} pago{settledCount !== 1 ? 's' : ''}
            </span>
            {first.category && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full border shrink-0"
                style={{
                  backgroundColor: first.category.color + '18',
                  color: first.category.color,
                  borderColor: first.category.color + '40',
                }}
              >
                {first.category.icon} {first.category.name}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-ink-600 overflow-hidden">
              <div
                className={`h-1 rounded-full transition-all ${allSettled ? 'bg-success' : 'bg-brand-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 shrink-0">{pct}%</span>
            {nextDue && !allSettled && (
              <span className="text-xs text-slate-500 shrink-0">
                próxima: {formatDate(nextDue.date)}
              </span>
            )}
          </div>
        </div>

        {/* Amount + edit + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            {/* Monthly value in highlight */}
            <p className={`font-bold text-sm ${isTheyOwe ? 'text-success' : 'text-danger'}`}>
              {isTheyOwe ? '+' : '-'}{formatCurrency(perInst)}<span className="text-xs font-normal opacity-70">/mês</span>
            </p>
            {/* Total remaining as secondary */}
            <p className="text-xs text-slate-500">
              {remaining} restantes · {formatCurrency(leftAmount)} total
            </p>
          </div>
          {/* Stop propagation so edit/delete clicks don't toggle open */}
          <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
            <EditEntryModal entry={first} categories={categories} isGroup groupSize={total} />
            <ConfirmDeleteButton
              action={async () => { await clientApi.deleteEntryGroup(first.id); window.location.reload() }}
              icon="trash"
              title={`Excluir grupo (${total} parcelas)`}
              className="flex items-center justify-center size-7 rounded-lg text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
            />
          </span>
          {open
            ? <ChevronDown className="size-4 text-slate-500 shrink-0" />
            : <ChevronRight className="size-4 text-slate-500 shrink-0" />}
        </div>
      </button>

      {/* Expanded installment list */}
      {open && (
        <div className="border-t border-ink-700 divide-y divide-ink-700/50">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                entry.isSettled ? 'opacity-50' : 'hover:bg-ink-750/50'
              }`}
            >
              {/* Parcela indicator */}
              <div className="w-6 shrink-0 text-center">
                {entry.isSettled
                  ? <CheckCircle2 className="size-3.5 text-success mx-auto" />
                  : <span className="text-xs font-semibold text-slate-500">{entry.installmentCurrent}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm ${entry.isSettled ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  Parcela {entry.installmentCurrent}
                </p>
                <p className="text-xs text-slate-600">
                  {formatDate(entry.date)}
                  {entry.isSettled && entry.settledAt && ` · acertada em ${formatDate(entry.settledAt)}`}
                </p>
              </div>

              <span className={`text-sm font-semibold shrink-0 ${
                entry.isSettled ? 'text-slate-500' : (isTheyOwe ? 'text-success' : 'text-danger')
              }`}>
                {formatCurrency(entry.amount)}
              </span>

              {!entry.isSettled && (
                <EditEntryModal entry={entry} categories={categories} />
              )}
              <EntryActions
                entryId={entry.id}
                personId={personId}
                isSettled={entry.isSettled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
