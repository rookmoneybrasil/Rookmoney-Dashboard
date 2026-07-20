'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, X, AlertTriangle, ToggleLeft, ToggleRight, Check, CalendarClock } from 'lucide-react'
import { clientApi, type RecurringBill, type Category } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringBillModal } from './edit-recurring-bill-modal'
import { InfoModal } from '@/components/ui/info-modal'

interface Props {
  bill:       RecurringBill
  categories: Category[]
  // This month's generated bill for this template (if any) — powers the Pay
  // button / "Pago" state. Undefined when nothing is generated (future
  // startMonth → "Agendado", or the current month before the generator ran).
  monthRow?:  { id: string; paid: boolean }
}

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// The recurring template is now the single payable card: it carries the Pay
// button (marks this month's generated bill paid) + the active/paused toggle,
// so there's no separate "Pendente" card for the current month.
export function RecurringBillRow({ bill, categories, monthRow }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [paying, setPaying] = useState(false)

  const now       = new Date()
  const curMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const scheduled = !!bill.startMonth && curMonth < bill.startMonth
  const paid      = monthRow?.paid ?? false

  const { mutate: toggle } = useMutation(
    () => clientApi.updateRecurringBill(bill.id, { isActive: !bill.isActive }),
  )

  const { mutate: remove, pending: removing } = useMutation(
    (deleteHistory: boolean) => clientApi.deleteRecurringBill(bill.id, deleteHistory),
  )

  async function handlePay() {
    if (!monthRow || paying) return
    setPaying(true)
    try {
      await clientApi.markBillPaid(monthRow.id, !paid)  // pagar, ou desfazer (some a transação)
      router.refresh()
    } catch {
      alert('Não foi possível atualizar o pagamento. Tente novamente.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      bill.isActive
        ? 'bg-brand-900/20 border-brand-700/30 hover:bg-brand-900/30'
        : 'bg-ink-800/50 border-ink-700/50 opacity-50'
    }`}>
      {/* Icon */}
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${bill.isActive ? 'bg-brand-800/60' : 'bg-ink-700'}`}>
        <RefreshCw className={`size-3.5 ${bill.isActive ? 'text-brand-400' : 'text-slate-500'}`} />
      </div>

      {/* Info (clique para detalhes) */}
      <InfoModal
        className="flex-1 min-w-0"
        typeLabel="Conta fixa"
        title={bill.name}
        amount={`-${formatCurrency(bill.amount)}/mês`}
        amountClass="text-danger"
        badge={!bill.isActive ? { label: 'Pausada', variant: 'default' } : scheduled ? { label: 'Agendada', variant: 'default' } : paid ? { label: 'Paga este mês', variant: 'success' } : { label: 'Ativa', variant: 'default' }}
        rows={[
          { label: 'Vencimento',  value: `Todo dia ${bill.dayOfMonth}` },
          { label: 'Categoria',   value: bill.category ? `${bill.category.icon} ${bill.category.name}` : 'Sem categoria' },
          { label: 'Conta',       value: bill.account ? `${bill.account.icon} ${bill.account.name}` : '' },
          { label: '1ª cobrança', value: bill.startMonth ? monthLabel(bill.startMonth) : '' },
          { label: 'Observações', value: bill.notes ?? '' },
        ]}
      >
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${bill.isActive ? 'text-slate-200' : 'text-slate-500'}`}>
            {bill.name}
          </p>
          {!bill.isActive && (
            <span className="text-[10px] bg-ink-700 text-slate-600 border border-ink-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pausada</span>
          )}
          {bill.isActive && scheduled && (
            <span className="text-[10px] bg-ink-700 text-slate-400 border border-ink-600 px-1.5 py-0.5 rounded-full font-medium shrink-0 flex items-center gap-0.5">
              <CalendarClock className="size-2.5" /> {monthLabel(bill.startMonth!)}
            </span>
          )}
          {bill.isActive && !scheduled && paid && (
            <span className="text-[10px] bg-success/15 text-success border border-success/30 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pago este mês</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="text-slate-300 font-medium">-{formatCurrency(bill.amount)}/mês</span>
          {' '}· dia {bill.dayOfMonth}
          {bill.category && ` · ${bill.category.icon} ${bill.category.name}`}
        </p>
      </InfoModal>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {!confirming && bill.isActive && !scheduled && monthRow && (
          paid ? (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              title="Desfazer pagamento deste mês"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-success hover:bg-success/10 transition-colors disabled:opacity-50"
            >
              <Check className="size-3.5" /> Pago
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-success/15 text-success border border-success/30 hover:bg-success/25 transition-colors disabled:opacity-50"
            >
              <Check className="size-3.5" /> {paying ? '...' : 'Pagar'}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => toggle(undefined as never)}
          title={bill.isActive ? 'Pausar conta fixa' : 'Ativar conta fixa'}
          className="size-7 rounded-lg flex items-center justify-center transition-colors text-slate-500 hover:text-slate-300 hover:bg-ink-700"
        >
          {bill.isActive ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4" />}
        </button>

        <EditRecurringBillModal bill={bill} categories={categories} />

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors"
            title="Remover conta fixa"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-0.5 mr-1">
              <AlertTriangle className="size-3 text-warning" /> Histórico:
            </span>
            <button
              type="button"
              onClick={() => remove(false)}
              disabled={removing}
              className="text-xs text-slate-300 hover:text-white px-1.5 py-1 rounded hover:bg-ink-700 transition-colors"
              title="Remove a conta fixa; os meses já pagos ficam no histórico"
            >
              {removing ? '...' : 'Manter'}
            </button>
            <button
              type="button"
              onClick={() => remove(true)}
              disabled={removing}
              className="text-xs text-danger hover:text-danger/80 px-1.5 py-1 rounded hover:bg-danger/10 transition-colors"
              title="Remove a conta fixa E apaga os lançamentos já pagos"
            >
              Apagar tudo
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-1 rounded hover:bg-ink-700 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
