'use client'

import { useState } from 'react'
import { X, CalendarDays, AlertTriangle, Layers, RefreshCw, Zap } from 'lucide-react'
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
  isTemplate?: boolean
}

export interface ProjectionMonth {
  label: string
  amount: number
  isCurrent: boolean
  breakdown: { fixed: number; avulso: number; installment: number }
  bills: ProjectionBill[]
}

// ─── Popup ────────────────────────────────────────────────────────────────────

function BillsPopup({ month, onClose }: { month: ProjectionMonth; onClose: () => void }) {
  const now  = new Date()
  const msod = new Date(now.getFullYear(), now.getMonth(), 1) // start of current month

  const overdue     = month.bills.filter(b => new Date(b.dueDate) < msod)
  const installment = month.bills.filter(b => b.isInstallment && new Date(b.dueDate) >= msod)
  const fixed       = month.bills.filter(b => b.isFixed && !b.isInstallment && new Date(b.dueDate) >= msod)
  const avulso      = month.bills.filter(b => !b.isFixed && !b.isInstallment && new Date(b.dueDate) >= msod)
  const recAvulso   = [...fixed, ...avulso].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const sumOf = (arr: ProjectionBill[]) => arr.reduce((s, b) => s + Math.abs(b.amount), 0)

  const blocks = [
    { label: 'Em atraso',         icon: AlertTriangle, color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/20',   total: sumOf(overdue),     count: overdue.length     },
    { label: 'Parceladas',        icon: Layers,        color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20', total: sumOf(installment), count: installment.length },
    { label: 'Fixas + Avulsas',   icon: RefreshCw,     color: 'text-slate-300', bg: 'bg-ink-600',     border: 'border-white/8',      total: sumOf(recAvulso),   count: recAvulso.length   },
  ].filter(b => b.count > 0)

  const sections: { label: string; icon: React.ElementType; bills: ProjectionBill[]; color: string }[] = [
    ...(overdue.length > 0     ? [{ label: 'Em atraso',      icon: AlertTriangle, bills: overdue,     color: 'text-danger'    }] : []),
    ...(installment.length > 0 ? [{ label: 'Parceladas',     icon: Layers,        bills: installment, color: 'text-brand-400' }] : []),
    ...(recAvulso.length > 0   ? [{ label: 'Fixas + Avulsas', icon: RefreshCw,    bills: recAvulso,   color: 'text-slate-400' }] : []),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-ink-800 border border-ink-600 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CalendarDays className="size-4 text-brand-400" />
              {month.label}
            </h2>
            <p className="text-sm text-danger font-semibold mt-0.5">-{formatCurrency(month.amount)}</p>
          </div>
          <button onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-ink-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* 3 summary blocks */}
        {blocks.length > 0 && (
          <div className={`grid gap-2 px-5 pt-4 shrink-0 ${blocks.length === 3 ? 'grid-cols-3' : blocks.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {blocks.map(b => (
              <div key={b.label} className={`rounded-xl border ${b.bg} ${b.border} p-3 flex flex-col gap-1`}>
                <div className={`flex items-center gap-1.5 ${b.color}`}>
                  <b.icon className="size-3" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">{b.label}</span>
                </div>
                <p className={`text-sm font-bold tabular-nums ${b.color}`}>{formatCurrency(b.total)}</p>
                <p className="text-[10px] text-slate-600">{b.count} conta{b.count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}

        {/* Bills list */}
        <div className="overflow-y-auto flex-1 mt-3">
          {month.bills.length === 0 ? (
            <p className="text-center text-sm text-slate-600 py-10">Nenhuma conta prevista para este mês</p>
          ) : sections.map(sec => (
            <div key={sec.label}>
              <div className="flex items-center gap-2 px-5 py-2 sticky top-0 bg-ink-800/95 backdrop-blur-sm border-y border-white/5">
                <sec.icon className={`size-3 ${sec.color}`} />
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${sec.color}`}>{sec.label}</span>
              </div>
              <div className="divide-y divide-white/5">
                {sec.bills.map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="size-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: (b.categoryColor ?? '#3B82F6') + '22', border: `1px solid ${b.categoryColor ?? '#3B82F6'}33` }}>
                      {b.categoryIcon ?? '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {b.name}
                        {b.isTemplate && <span className="ml-1.5 text-[9px] text-slate-600 bg-ink-600 px-1 py-0.5 rounded">prevista</span>}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {b.categoryName ?? 'Sem categoria'} · {formatDate(b.dueDate)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-100 tabular-nums shrink-0">
                      {formatCurrency(Math.abs(b.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between shrink-0 bg-ink-800">
          <span className="text-xs text-slate-500">{month.bills.length} conta{month.bills.length !== 1 ? 's' : ''} no total</span>
          <span className="text-sm font-bold text-danger">-{formatCurrency(month.amount)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Projection cards ─────────────────────────────────────────────────────────

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
              <p className="text-[9px] text-slate-700 mt-2">Ver detalhes →</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-600 mt-2">Fixas + avulsos agendados + parcelas vencendo em cada mês.</p>
      </div>

      {selected && <BillsPopup month={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
