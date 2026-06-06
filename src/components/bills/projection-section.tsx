'use client'

import { useState } from 'react'
import { X, CalendarDays } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface ProjectionBill {
  id: string
  name: string
  amount: number
  dueDate: string
  isFixed: boolean
  isInstallment: boolean
  categoryIcon: string | null
  categoryName: string | null
  categoryColor: string | null
  isTemplate?: boolean // recurring template (future months)
}

export interface ProjectionMonth {
  label: string
  amount: number
  isCurrent: boolean
  breakdown: { fixed: number; avulso: number; installment: number }
  bills: ProjectionBill[]
}

export function ProjectionSection({ months }: { months: ProjectionMonth[] }) {
  const [selected, setSelected] = useState<ProjectionMonth | null>(null)

  return (
    <>
      <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="size-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-300">Projeção de gastos</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {months.map(m => (
            <button key={m.label} onClick={() => setSelected(m)}
              className={`text-left rounded-lg p-3 border transition-all ${
                m.isCurrent
                  ? 'border-brand-600/40 bg-brand-900/20 hover:bg-brand-900/35'
                  : 'border-ink-600 bg-ink-700/50 hover:bg-ink-700'
              }`}>
              <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                {m.isCurrent && <span className="size-1.5 rounded-full bg-brand-400 inline-block" />}
                {m.label}
              </p>
              <p className="text-sm font-bold text-danger mb-1.5">-{formatCurrency(m.amount)}</p>
              <div className="flex flex-col gap-0.5">
                {m.breakdown.fixed       > 0 && <p className="text-[10px] text-slate-600">🔁 {formatCurrency(m.breakdown.fixed)} fixas</p>}
                {m.breakdown.avulso      > 0 && <p className="text-[10px] text-slate-600">💸 {formatCurrency(m.breakdown.avulso)} avulso</p>}
                {m.breakdown.installment > 0 && <p className="text-[10px] text-slate-600">📅 {formatCurrency(m.breakdown.installment)} parcelas</p>}
              </div>
              <p className="text-[9px] text-slate-700 mt-2">Clique para detalhar →</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-600 mt-2">Fixas + avulsos agendados + parcelas vencendo em cada mês.</p>
      </div>

      {/* Popup */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-ink-800 border border-ink-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-100 capitalize">{selected.label}</h2>
                <p className="text-sm text-danger font-semibold">-{formatCurrency(selected.amount)}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="size-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-ink-600 transition-colors">
                <X className="size-4" />
              </button>
            </div>

            {/* Bills list */}
            <div className="overflow-y-auto flex-1 divide-y divide-white/5">
              {selected.bills.length === 0 ? (
                <p className="text-center text-sm text-slate-600 py-10">Nenhuma conta prevista para este mês</p>
              ) : selected.bills.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="size-9 rounded-xl flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: (b.categoryColor ?? '#3B82F6') + '22', border: `1px solid ${b.categoryColor ?? '#3B82F6'}33` }}>
                    {b.categoryIcon ?? '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {b.name}
                      {b.isTemplate && <span className="ml-1.5 text-[9px] text-slate-600 bg-ink-600 px-1 py-0.5 rounded">prevista</span>}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {b.isFixed ? '🔁 fixa' : b.isInstallment ? '📅 parcela' : '💸 avulso'}
                      {b.categoryName ? ` · ${b.categoryName}` : ''}
                      {' · '}{formatDate(b.dueDate)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-slate-100 tabular-nums shrink-0">
                    {formatCurrency(Number(b.amount))}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer total */}
            <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">{selected.bills.length} conta{selected.bills.length !== 1 ? 's' : ''}</span>
              <span className="text-sm font-bold text-danger">-{formatCurrency(selected.amount)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
