'use client'

import { useState } from 'react'
import { Pencil, Trash2, ToggleLeft, ToggleRight, Check, X } from 'lucide-react'
import { clientApi, type RecurringBill, type Category } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringBillModal } from './edit-recurring-bill-modal'

interface Props {
  bill:       RecurringBill
  categories: Category[]
}

function ordinal(n: number) {
  return `todo dia ${n}`
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
    <div className={`flex items-center gap-4 px-5 py-4 hover:bg-ink-600/20 transition-colors group ${!bill.isActive ? 'opacity-50' : ''}`}>
      {/* Icon */}
      <div className="size-9 rounded-xl bg-ink-600 flex items-center justify-center shrink-0 text-slate-400">
        {bill.category?.icon ?? '💸'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-200 truncate">{bill.name}</p>
          {!bill.isActive && <span className="text-[10px] text-slate-600 bg-ink-700 px-1.5 py-0.5 rounded">Pausada</span>}
        </div>
        <p className="text-xs text-slate-500">
          {bill.category?.name ?? 'Sem categoria'} · {ordinal(bill.dayOfMonth)}
        </p>
      </div>

      {/* Amount */}
      <span className="text-sm font-semibold text-slate-300 tabular-nums shrink-0">
        {formatCurrency(bill.amount)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => toggle(undefined as never)}
          title={bill.isActive ? 'Pausar' : 'Ativar'}
          className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
        >
          {bill.isActive ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4" />}
        </button>

        <EditRecurringBillModal bill={bill} categories={categories} />

        {confirming ? (
          <>
            <button
              type="button"
              onClick={() => remove(undefined as never)}
              disabled={removing}
              className="size-7 rounded-lg flex items-center justify-center text-danger hover:bg-danger/10 transition-colors"
              title="Confirmar exclusão"
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-ink-700 transition-colors"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
            title="Excluir conta fixa"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}
