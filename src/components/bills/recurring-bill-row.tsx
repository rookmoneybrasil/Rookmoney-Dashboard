'use client'

import { useState } from 'react'
import { RefreshCw, X, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react'
import { clientApi, type RecurringBill, type Category } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringBillModal } from './edit-recurring-bill-modal'

interface Props {
  bill:       RecurringBill
  categories: Category[]
}

export function RecurringBillRow({ bill, categories }: Props) {
  const [confirming, setConfirming] = useState(false)

  const { mutate: toggle } = useMutation(
    () => clientApi.updateRecurringBill(bill.id, { isActive: !bill.isActive }),
  )

  const { mutate: remove, pending: removing } = useMutation(
    () => clientApi.deleteRecurringBill(bill.id),
  )

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

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${bill.isActive ? 'text-slate-200' : 'text-slate-500'}`}>
            {bill.name}
          </p>
          {!bill.isActive && (
            <span className="text-[10px] bg-ink-700 text-slate-600 border border-ink-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pausada</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className="text-slate-300 font-medium">-{formatCurrency(bill.amount)}/mês</span>
          {' '}· dia {bill.dayOfMonth}
          {bill.category && ` · ${bill.category.icon} ${bill.category.name}`}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
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
              <AlertTriangle className="size-3 text-warning" /> Remover?
            </span>
            <button
              type="button"
              onClick={() => remove(undefined as never)}
              disabled={removing}
              className="text-xs text-danger hover:text-danger/80 px-1.5 py-1 rounded hover:bg-danger/10 transition-colors"
            >
              {removing ? '...' : 'Sim'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-1 rounded hover:bg-ink-700 transition-colors"
            >
              Não
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
