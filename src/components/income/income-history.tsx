'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, History, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

type Category = { id: string; name: string; icon: string; color: string } | null
type HistoryEntry = { id: string; amount: number; date: string; category: Category }
interface SourceMeta { id: string; name: string; isRecurring: boolean; lastAutoPayMonth: string | null }

interface Props {
  sources:      SourceMeta[]
  history:      Record<string, HistoryEntry[]>
  currentMonth: string
}

export function IncomeHistory({ sources, history, currentMonth }: Props) {
  const [open, setOpen] = useState(false)

  const withHistory = sources.filter((s) => (history[s.name]?.length ?? 0) > 0)
  if (withHistory.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors w-fit"
      >
        <History className="size-3.5" />
        Histórico de recebimentos
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>

      {open && (
        <Card padding="none">
          <CardContent>
            <div className="divide-y divide-white/5">
              {withHistory.map((source) => {
                const entries    = history[source.name] ?? []
                const canRevert  = !source.isRecurring && source.lastAutoPayMonth === currentMonth
                const hasVariation = entries.length > 1 && entries.some((e) => e.amount !== entries[0].amount)
                return (
                  <SourceHistory
                    key={source.id}
                    sourceId={source.id}
                    name={source.name}
                    entries={entries}
                    canRevert={canRevert}
                    hasVariation={hasVariation}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SourceHistory({ sourceId, name, entries, canRevert, hasVariation }: {
  sourceId:     string
  name:         string
  entries:      HistoryEntry[]
  canRevert:    boolean
  hasVariation: boolean
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { mutate: revert, pending } = useMutation(
    () => clientApi.revertIncomeReceipt(sourceId),
    { onSuccess: () => router.refresh() },
  )

  const latest = entries[0]

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-ink-600/20 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-300 truncate">{name}</p>
            {hasVariation && (
              <span className="text-[10px] text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded shrink-0">
                variação de valor
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600">
            {entries.length} pagamento{entries.length !== 1 ? 's' : ''} registrado{entries.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {latest && (
            <span className="text-sm font-semibold text-success tabular-nums">
              {formatCurrency(latest.amount)}
            </span>
          )}
          {canRevert && (
            <span onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => revert()}
                disabled={pending}
                title="Desfazer recebimento e remover transação"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
              >
                <RotateCcw className="size-3.5" />
                Desfazer
              </button>
            </span>
          )}
          {open
            ? <ChevronDown className="size-3.5 text-slate-500 shrink-0" />
            : <ChevronRight className="size-3.5 text-slate-500 shrink-0" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 bg-ink-800/40">
          {entries.map((entry, i) => {
            const prev    = entries[i + 1]
            const changed = prev && entry.amount !== prev.amount
            return (
              <div key={entry.id} className="flex items-start gap-4 px-6 py-3 border-b border-white/[0.03] last:border-0">
                {/* Date */}
                <div className="min-w-[120px] shrink-0">
                  <p className="text-xs font-medium text-slate-300">
                    {formatDate(entry.date, "dd 'de' MMM yyyy")}
                  </p>
                </div>

                {/* Category */}
                <div className="flex-1 min-w-0">
                  {entry.category ? (
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: entry.category.color + '18',
                        color:           entry.category.color,
                        borderColor:     entry.category.color + '40',
                      }}
                    >
                      {entry.category.icon} {entry.category.name}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600">Sem categoria</span>
                  )}
                </div>

                {/* Amount + variation badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {changed && (
                    <span className="text-[10px] text-warning bg-warning/10 px-1.5 py-0.5 rounded">
                      era {formatCurrency(prev!.amount)}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-success tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
