'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlertCircle, Check, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { EditBillModal } from './edit-bill-modal'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { clientApi, type Bill, type Category } from '@/lib/api-client'
import { playBillPaid } from '@/lib/sounds'

const statusConfig = {
  paid:    { label: 'Pago',     variant: 'success' as const, icon: Check       },
  pending: { label: 'Pendente', variant: 'default' as const, icon: Clock       },
  urgent:  { label: 'Urgente',  variant: 'warning' as const, icon: AlertCircle },
  overdue: { label: 'Atrasado', variant: 'danger'  as const, icon: AlertCircle },
}

interface Props {
  bills: Bill[]
  categories: Category[]
}

// Optimistic version of the "Pendentes" list — clicking pay/delete updates
// this list instantly instead of waiting for the mutation + a full
// router.refresh() round-trip. The rest of the page (totals, projections,
// paid history) is server-rendered and still lags a moment behind via the
// background refresh() below — porting that whole computation client-side
// too would mean duplicating a lot of business logic for a section the
// user isn't staring at during the click.
export function PendingBillsList({ bills, categories }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(bills)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  // Resync whenever the server sends fresh data (after the background
  // refresh completes, or on navigation back to this page).
  useEffect(() => { setItems(bills) }, [bills])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function markPaid(id: string) {
    const prev = items
    setItems(items.filter(b => b.id !== id)) // optimistic: leaves "pending" once paid
    setBusy(id, true)
    try {
      await clientApi.markBillPaid(id, true)
      playBillPaid()
      router.refresh()
    } catch {
      setItems(prev)
      alert('Erro ao marcar como paga. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  async function deleteBill(id: string) {
    const prev = items
    setItems(items.filter(b => b.id !== id))
    setBusy(id, true)
    try {
      await clientApi.deleteBill(id)
      router.refresh()
    } catch {
      setItems(prev)
      alert('Erro ao excluir a conta. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
        <p className="text-xs text-success">Nenhuma conta pendente 🎉</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((bill) => {
        const status = classifyBillStatus(bill.dueDate, bill.isPaid)
        const cfg    = statusConfig[status]
        const Icon   = cfg.icon
        const busy   = busyIds.has(bill.id)
        return (
          <div key={bill.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${
            status === 'overdue' ? 'bg-danger/8 border-danger/25 hover:bg-danger/12'
            : status === 'urgent' ? 'bg-warning/5 border-warning/20 hover:bg-warning/8'
            : 'bg-ink-800 border-ink-700 hover:bg-ink-700/80'
          } ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
              status === 'overdue' ? 'bg-danger/15' : status === 'urgent' ? 'bg-warning/15' : 'bg-ink-600'
            }`}>
              {bill.category?.icon
                ? <span>{bill.category.icon}</span>
                : bill.recurringBillId
                ? <RefreshCw className="size-3.5 text-brand-400" />
                : <Icon className={`size-3.5 ${status === 'overdue' ? 'text-danger' : status === 'urgent' ? 'text-warning' : 'text-slate-500'}`} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-sm font-medium text-slate-200 truncate">{bill.name}</p>
                {bill.recurringBillId && <span className="text-[10px] text-brand-500">↻ fixa</span>}
                <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {bill.category?.name ?? 'Sem categoria'} · vence {formatDate(bill.dueDate)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(bill.amount)}</span>
              <button
                onClick={() => markPaid(bill.id)}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-success bg-success/10 hover:bg-success/20 border border-success/30"
                title="Marcar como paga"
              >
                <Check className="size-3.5" />
                Pagar
              </button>
              <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <EditBillModal bill={bill} categories={categories} />
                <ConfirmDeleteButton
                  action={() => deleteBill(bill.id)}
                  icon="trash" label="Excluir conta?"
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
