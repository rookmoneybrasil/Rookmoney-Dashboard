'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, AlertTriangle, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { clientApi, type RecurringTransaction, type Category } from '@/lib/api-client'
import { RecurringModal } from './recurring-modal'

const freqLabel: Record<string, string> = {
  MONTHLY: 'Mensal',
  WEEKLY:  'Semanal',
  YEARLY:  'Anual',
}

interface Props {
  items: RecurringTransaction[]
  categories: Category[]
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

// Optimistic toggle (active/inactive) + delete for recurring transactions.
export function RecurringList({ items, categories }: Props) {
  const router = useRouter()
  const [list, setList] = useState(items)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  useEffect(() => { setList(items) }, [items])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function toggle(id: string) {
    if (busyIds.has(id)) return
    let rollback: RecurringTransaction[] | null = null
    setList(prev => { rollback = prev; return prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r) })
    setBusy(id, true)
    try {
      await clientApi.toggleRecurring(id)
      router.refresh()
    } catch {
      if (rollback) setList(rollback)
      alert('Erro ao atualizar. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  async function remove(id: string) {
    if (busyIds.has(id)) return
    let rollback: RecurringTransaction[] | null = null
    setList(prev => { rollback = prev; return prev.filter(r => r.id !== id) })
    setBusy(id, true)
    try {
      await clientApi.deleteRecurring(id)
      router.refresh()
    } catch {
      if (rollback) setList(rollback)
      alert('Erro ao excluir. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  const active   = list.filter((r) => r.isActive)
  const inactive = list.filter((r) => !r.isActive)

  function Row({ rec }: { rec: RecurringTransaction }) {
    const isIncome = rec.type === 'INCOME'
    const busy = busyIds.has(rec.id)
    return (
      <div className={`flex items-center gap-4 px-5 py-4 hover:bg-ink-600/30 transition-all group ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="size-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
          style={{ backgroundColor: rec.category.color + '22', color: rec.category.color }}>
          {rec.category.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-slate-200 truncate">{rec.name}</p>
            <Badge variant={isIncome ? 'success' : 'default'} size="sm">
              {isIncome ? <TrendingUp className="size-3 inline mr-1" /> : <TrendingDown className="size-3 inline mr-1" />}
              {isIncome ? 'Receita' : 'Despesa'}
            </Badge>
            <Badge variant="outline" size="sm">{freqLabel[rec.frequency] ?? rec.frequency}</Badge>
            {rec.frequency === 'MONTHLY' && rec.dayOfMonth && (
              <span className="text-xs text-slate-600">dia {rec.dayOfMonth}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {rec.category.icon} {rec.category.name}
            {rec.description ? ` · ${rec.description}` : ''}
          </p>
        </div>
        <span className={`text-sm font-semibold tabular-nums shrink-0 ${isIncome ? 'text-success' : 'text-slate-300'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(rec.amount)}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggle(rec.id)}
            disabled={busy}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 ${
              rec.isActive
                ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                : 'bg-ink-600 text-slate-500 border border-white/6 hover:bg-ink-500'
            }`}
            title={rec.isActive ? 'Desativar' : 'Ativar'}
          >
            {rec.isActive ? 'Ativa' : 'Inativa'}
          </button>
          <RecurringModal categories={categories} item={rec} />
          <DeleteInline id={rec.id} busy={busy} onDelete={remove} />
        </div>
      </div>
    )
  }

  return (
    <>
      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ativas</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {active.map((rec) => <Row key={rec.id} rec={rec} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {inactive.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inativas</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5 opacity-60">
                {inactive.map((rec) => <Row key={rec.id} rec={rec} />)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
