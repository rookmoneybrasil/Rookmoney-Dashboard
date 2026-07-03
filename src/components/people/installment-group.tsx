'use client'

import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EditEntryModal } from './edit-entry-modal'
import { MarkEntrySettledButton } from './mark-entry-settled-button'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { Trash2 } from 'lucide-react'
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

// Mirrors the Bills "Parceladas" card (app/(dashboard)/bills/page.tsx) —
// same Card + <details> disclosure + Progress bar + per-installment rows,
// with the direction color (te deve / você deve) taking the place of
// Bills' single-direction expense styling.
export function InstallmentGroup({ personId, entries, categories }: Props) {
  if (entries.length === 0) return null

  const first        = entries[0]
  const total        = first.installmentTotal ?? entries.length
  const isTheyOwe     = first.type === 'THEY_OWE_ME'
  // Infer already-paid from the first installmentCurrent (e.g. if first entry is 2/4, already paid = 1)
  const alreadyPaid  = Math.max(0, (first.installmentCurrent ?? 1) - 1)
  const settledInApp = entries.filter((e) => e.isSettled).length
  const settledCount = alreadyPaid + settledInApp  // total paid = pre-app + settled in app
  const name         = baseDescription(first.description)
  const perInst      = Number(first.amount)
  const nextDue      = entries.find((e) => !e.isSettled)
  const pct          = Math.round((settledCount / total) * 100)

  return (
    <Card>
      <CardContent className="p-0">
        <details open className="group/det">
          <summary className="flex items-center gap-3 p-4 cursor-pointer list-none select-none">
            <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${isTheyOwe ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {isTheyOwe ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{name}</p>
              <p className="text-xs text-slate-500">{formatCurrency(perInst)}/parcela · {total}x · <span className="text-slate-400 font-medium">{formatCurrency(perInst * total)} total</span></p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-400 tabular-nums">{settledCount}/{total}</span>
              <ChevronDown className="size-4 text-slate-600 transition-transform duration-200 group-open/det:rotate-180" />
            </div>
          </summary>
          <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
            <div className="flex flex-col gap-1.5">
              <Progress value={settledCount} max={total} variant={isTheyOwe ? 'success' : 'danger'} size="sm" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{pct}% acertado</span>
                {nextDue && <span className="text-xs text-slate-500">Próxima: {formatDate(nextDue.date)}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              {entries.map((entry) => (
                <div key={entry.id} className={`flex items-center justify-between gap-2 py-1.5 ${entry.isSettled ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs tabular-nums text-slate-600 w-7 shrink-0">{entry.installmentCurrent}ª</span>
                    <span className="text-xs text-slate-500">{formatDate(entry.date)}</span>
                    <span className={`text-xs font-semibold tabular-nums ${entry.isSettled ? 'text-slate-500' : (isTheyOwe ? 'text-success' : 'text-danger')}`}>{formatCurrency(entry.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={entry.isSettled ? 'success' : 'default'} size="sm">
                      {entry.isSettled ? 'Acertado' : 'Pendente'}
                    </Badge>
                    <EditEntryModal entry={entry} categories={categories} />
                    <MarkEntrySettledButton entryId={entry.id} isSettled={entry.isSettled} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <EditEntryModal entry={first} categories={categories} isGroup groupSize={total} />
              <ConfirmDeleteButton
                action={async () => { await clientApi.deleteEntryGroup(first.id); window.location.reload() }}
                label="Cancelar parcelamento? Todos os lançamentos serão excluídos."
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-danger transition-colors py-1 px-2 rounded-lg hover:bg-danger/10 mt-1"
              >
                <Trash2 className="size-3" />
                Cancelar parcelamento
              </ConfirmDeleteButton>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
