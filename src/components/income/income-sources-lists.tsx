'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Zap, AlertTriangle, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { clientApi, type IncomeSource, type Category } from '@/lib/api-client'
import { IncomeSourceModal } from './income-source-modal'
import { RegisterReceiptModal } from './register-receipt-modal'

const TYPE_CONFIG = {
  EMPLOYMENT: { label: 'CLT / PJ',  icon: '💼', variant: 'brand'   as const },
  FREELANCE:  { label: 'Freelance', icon: '🧑‍💻', variant: 'default' as const },
  RENTAL:     { label: 'Aluguel',   icon: '🏠', variant: 'default' as const },
  OTHER:      { label: 'Outro',     icon: '💡', variant: 'default' as const },
}

function receivedDateLabel(source: { isRecurring: boolean; dayOfMonth: number | null; lastAutoPayMonth: string | null }): string {
  if (!source.lastAutoPayMonth) return '—'
  if (source.isRecurring && source.dayOfMonth) {
    const [y, m] = source.lastAutoPayMonth.split('-').map(Number)
    return format(new Date(y, m - 1, source.dayOfMonth), "dd 'de' MMM", { locale: ptBR })
  }
  const [y, m] = source.lastAutoPayMonth.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM yyyy', { locale: ptBR })
}

function DeleteInline({ id, busy, onDelete }: { id: string; busy: boolean; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-150">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
          <AlertTriangle className="size-3 text-warning shrink-0" />
          Excluir?
        </span>
        <button onClick={() => { setConfirming(false); onDelete(id) }}
          className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20">
          Sim
        </button>
        <button onClick={() => setConfirming(false)}
          className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors">
          Não
        </button>
      </div>
    )
  }
  return (
    <button onClick={() => setConfirming(true)} disabled={busy}
      className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
      title="Excluir">
      <Trash2 className="size-3.5" />
    </button>
  )
}

interface Props {
  sources: IncomeSource[]
  categories: Category[]
  currentMonth: string
  now: string // ISO date string
}

// Optimistic delete for income sources — recurring + eventual sections.
// "Recebi" (RegisterReceiptModal) stays as-is: it's a modal flow with its
// own fields, not a one-click action, so the background refresh cost is
// less noticeable there.
export function IncomeSourcesLists({ sources, categories, currentMonth, now: nowIso }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(sources)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const now = new Date(nowIso)

  useEffect(() => { setItems(sources) }, [sources])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function deleteSource(id: string) {
    if (busyIds.has(id)) return
    let rollback: IncomeSource[] | null = null
    setItems(prev => { rollback = prev; return prev.filter(s => s.id !== id) })
    setBusy(id, true)
    try {
      await clientApi.deleteIncomeSource(id)
      router.refresh()
    } catch {
      if (rollback) setItems(rollback)
      alert('Erro ao excluir a renda. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  const recurring        = items.filter((s) =>  s.isRecurring)
  const nonRecurring      = items.filter((s) => !s.isRecurring)
  const eventualPending   = nonRecurring.filter((s) => s.lastAutoPayMonth === null)
  const totalRecorrente   = recurring.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Recorrentes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-success shrink-0" />
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <RefreshCw className="size-4 text-success" /> Recorrentes
            {totalRecorrente > 0 && <span className="text-xs font-normal text-slate-500">{formatCurrency(totalRecorrente)}/mês</span>}
          </h2>
        </div>
        <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
          💰 <strong className="text-slate-300">Recorrentes</strong> são lançadas automaticamente no dia configurado — aparece <strong className="text-slate-300">A receber</strong> até o dia chegar.
        </div>
        {recurring.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
            <p className="text-xs text-slate-600">Nenhuma renda recorrente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recurring.map((source) => {
              const cfg      = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
              const received = source.lastAutoPayMonth === currentMonth
              const isFuture = !!source.startDate && new Date(source.startDate) > now
              const startLabel = isFuture ? format(new Date(source.startDate!), "MMMM 'de' yyyy", { locale: ptBR }) : null
              const busy = busyIds.has(source.id)

              return (
                <div key={source.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${
                  received  ? 'bg-success/5 border-success/20 opacity-70'
                  : isFuture ? 'bg-ink-800/50 border-ink-700/50 opacity-50'
                  : 'bg-success/5 border-success/15 hover:bg-success/8'
                } ${busy ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-base ${received ? 'bg-success/15' : 'bg-success/10'}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                      {isFuture  && <Badge variant="default" size="sm" dot>Começa em {startLabel}</Badge>}
                      {!isFuture && received  && <Badge variant="success" size="sm" dot>Recebido</Badge>}
                      {!isFuture && !received && <Badge variant="warning" size="sm" dot>A receber</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="text-success font-medium">+{formatCurrency(source.amount)}/mês</span>
                      {source.dayOfMonth && ` · dia ${source.dayOfMonth}`}
                      {received && ` · ${receivedDateLabel(source)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <IncomeSourceModal source={source} categories={categories} />
                    <DeleteInline id={source.id} busy={busy} onDelete={deleteSource} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Eventuais */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-warning shrink-0" />
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="size-4 text-warning" /> Eventuais
            {nonRecurring.reduce((s, r) => s + Number(r.amount), 0) > 0 && (
              <span className="text-xs font-normal text-slate-500">{formatCurrency(nonRecurring.reduce((s, r) => s + Number(r.amount), 0))}</span>
            )}
          </h2>
        </div>
        <div className="bg-warning/5 border border-warning/20 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
          ⚡ <strong className="text-slate-300">Eventuais</strong> ficam aguardando até você clicar em <strong className="text-slate-300">Recebi</strong> — gera a transação na data informada.
        </div>
        {eventualPending.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
            <p className="text-xs text-slate-600">Nenhuma renda eventual pendente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {eventualPending.map((source) => {
              const cfg  = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
              const busy = busyIds.has(source.id)
              return (
                <div key={source.id} className={`flex items-center gap-3 p-3.5 rounded-xl border bg-warning/5 border-warning/15 hover:bg-warning/8 transition-all group ${busy ? 'opacity-30 pointer-events-none' : ''}`}>
                  <div className="size-8 rounded-lg flex items-center justify-center shrink-0 text-base bg-warning/10">
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="text-success font-medium">+{formatCurrency(source.amount)}</span>
                      {source.notes ? ` · ${source.notes}` : ' · Pontual'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <RegisterReceiptModal source={source} categories={categories} />
                    <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <IncomeSourceModal source={source} categories={categories} />
                      <DeleteInline id={source.id} busy={busy} onDelete={deleteSource} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
