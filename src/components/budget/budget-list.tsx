'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { clientApi, type BudgetItem, type Category } from '@/lib/api-client'
import { BudgetModal } from './budget-modal'
import { InfoModal } from '@/components/ui/info-modal'

interface Props {
  budgets: BudgetItem[]
  categories: Category[]
  month: string
}

// Optimistic delete for budget rows.
export function BudgetList({ budgets, categories, month }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(budgets)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => { setItems(budgets) }, [budgets])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function deleteBudget(id: string) {
    if (busyIds.has(id)) return
    let rollback: BudgetItem[] | null = null
    setItems(prev => { rollback = prev; return prev.filter(b => b.id !== id) })
    setBusy(id, true)
    try {
      await clientApi.deleteBudget(id)
      router.refresh()
    } catch {
      if (rollback) setItems(rollback)
      alert('Erro ao excluir o orçamento. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  return (
    <Card padding="none">
      <CardContent>
        <div className="divide-y divide-white/5">
          {items.map((b) => {
            const pct       = Number(b.amount) > 0 ? Math.min(Math.round((b.spent / Number(b.amount)) * 100), 100) : 0
            const isOver    = b.spent > Number(b.amount)
            const isWarning = !isOver && pct >= 80
            const busy      = busyIds.has(b.id)

            return (
              <div key={b.id} className={`flex items-center gap-4 px-5 py-4 group hover:bg-ink-600/20 transition-all ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="size-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: b.category.color + '22', color: b.category.color }}>
                  {b.category.icon}
                </div>
                <InfoModal
                  className="flex-1 min-w-0 flex flex-col gap-1.5"
                  typeLabel="Orçamento"
                  title={`${b.category.icon} ${b.category.name}`}
                  amount={formatCurrency(b.spent)}
                  amountClass={isOver ? 'text-danger' : 'text-slate-100'}
                  badge={isOver ? { label: 'Acima do limite', variant: 'danger' } : isWarning ? { label: `Atenção ${pct}%`, variant: 'warning' } : { label: `${pct}%`, variant: 'default' }}
                  rows={[
                    { label: 'Limite',                 value: formatCurrency(Number(b.amount)) },
                    { label: 'Gasto',                  value: formatCurrency(b.spent) },
                    { label: isOver ? 'Excedeu' : 'Resta', value: formatCurrency(Math.abs(Number(b.amount) - b.spent)) },
                    { label: 'Uso',                    value: `${pct}%` },
                  ]}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate">{b.category.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      {isOver && <Badge variant="danger" size="sm" dot>Acima do limite</Badge>}
                      {isWarning && <Badge variant="warning" size="sm" dot>Atenção {pct}%</Badge>}
                      {!isOver && !isWarning && <span className="text-xs text-slate-600 tabular-nums">{pct}%</span>}
                      <span className="text-xs text-slate-500 tabular-nums">
                        {formatCurrency(b.spent, true)} / {formatCurrency(Number(b.amount), true)}
                      </span>
                    </div>
                  </div>
                  <Progress value={b.spent} max={Number(b.amount)} variant={isOver ? 'danger' : isWarning ? 'warning' : 'brand'} size="sm" />
                </InfoModal>
                <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <BudgetModal categories={categories} month={month} budget={b} />
                  {confirmingId === b.id ? (
                    <div className="flex items-center gap-1 animate-in fade-in duration-150">
                      <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
                        <AlertTriangle className="size-3 text-warning shrink-0" />
                        Excluir?
                      </span>
                      <button onClick={() => { setConfirmingId(null); deleteBudget(b.id) }}
                        className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20">
                        Sim
                      </button>
                      <button onClick={() => setConfirmingId(null)}
                        className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors">
                        Não
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmingId(b.id)} disabled={busy}
                      className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                      title="Excluir">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
