'use client'

import { useState } from 'react'
import { X, CalendarDays, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface PersonProjectionItem {
  id:       string
  desc:     string
  amount:   number
  category: { id: string; name: string; icon: string; color: string } | null
}

export interface PersonProjectionMonth {
  label:        string
  isCurrent:    boolean
  theyOwe:      number
  iOwe:         number
  balance:      number
  theyOweItems: PersonProjectionItem[]
  iOweItems:    PersonProjectionItem[]
}

// ─── Popup ────────────────────────────────────────────────────────────────────

function ItemList({ items }: { items: PersonProjectionItem[] }) {
  return (
    <div className="divide-y divide-white/5">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3 px-5 py-3">
          <div className="size-8 rounded-lg flex items-center justify-center text-sm shrink-0"
            style={{ backgroundColor: (item.category?.color ?? '#3B82F6') + '22', border: `1px solid ${item.category?.color ?? '#3B82F6'}33` }}>
            {item.category?.icon ?? '📋'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{item.desc}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{item.category?.name ?? 'Sem categoria'}</p>
          </div>
          <span className="text-sm font-semibold text-slate-100 tabular-nums shrink-0">
            {formatCurrency(item.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

function PersonProjectionPopup({ month, onClose }: { month: PersonProjectionMonth; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
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
            <p className={`text-sm font-semibold mt-0.5 ${month.balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}
            </p>
          </div>
          <button onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-ink-600 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* 2 summary blocks */}
        <div className="grid grid-cols-2 gap-2 px-5 pt-4 shrink-0">
          <div className="rounded-xl border bg-success/10 border-success/20 p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-success">
              <TrendingUp className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Te deve</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-success">{formatCurrency(month.theyOwe)}</p>
            <p className="text-[10px] text-slate-600">{month.theyOweItems.length} item{month.theyOweItems.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl border bg-danger/10 border-danger/20 p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-danger">
              <TrendingDown className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Você deve</span>
            </div>
            <p className="text-sm font-bold tabular-nums text-danger">{formatCurrency(month.iOwe)}</p>
            <p className="text-[10px] text-slate-600">{month.iOweItems.length} item{month.iOweItems.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-y-auto flex-1 mt-3">
          {month.theyOweItems.length === 0 && month.iOweItems.length === 0 ? (
            <p className="text-center text-sm text-slate-600 py-10">Nada previsto para este mês</p>
          ) : (
            <>
              {month.theyOweItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-5 py-2 sticky top-0 bg-ink-800/95 backdrop-blur-sm border-y border-white/5">
                    <TrendingUp className="size-3 text-success" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-success">Te deve</span>
                  </div>
                  <ItemList items={month.theyOweItems} />
                </div>
              )}
              {month.iOweItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-5 py-2 sticky top-0 bg-ink-800/95 backdrop-blur-sm border-y border-white/5">
                    <TrendingDown className="size-3 text-danger" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-danger">Você deve</span>
                  </div>
                  <ItemList items={month.iOweItems} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between shrink-0 bg-ink-800">
          <span className="text-xs text-slate-500">
            {month.theyOweItems.length + month.iOweItems.length} item{month.theyOweItems.length + month.iOweItems.length !== 1 ? 's' : ''} no total
          </span>
          <span className={`text-sm font-bold ${month.balance >= 0 ? 'text-success' : 'text-danger'}`}>
            {month.balance >= 0 ? '+' : ''}{formatCurrency(month.balance)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Projection cards ─────────────────────────────────────────────────────────

export function PersonProjectionSection({ months }: { months: PersonProjectionMonth[] }) {
  const [selected, setSelected] = useState<PersonProjectionMonth | null>(null)

  return (
    <>
      <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="size-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-300">Projeção dos próximos meses</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {months.map(m => (
            <button key={m.label} onClick={() => setSelected(m)}
              className={`text-left rounded-lg p-3 border transition-all ${
                m.isCurrent
                  ? 'border-brand-600/40 bg-brand-900/20 hover:bg-brand-900/35'
                  : 'border-ink-600 bg-ink-700/50 hover:bg-ink-700'
              }`}>
              <p className="text-[11px] text-slate-500 capitalize mb-2 flex items-center gap-1">
                {m.isCurrent && <span className="size-1.5 rounded-full bg-brand-400 inline-block" />}
                {m.label}
              </p>
              {m.theyOwe > 0 && m.iOwe > 0 && (
                <>
                  <p className="text-xs text-success font-medium">+{formatCurrency(m.theyOwe)}</p>
                  <p className="text-xs text-danger font-medium">-{formatCurrency(m.iOwe)}</p>
                </>
              )}
              <p className={`text-sm font-bold mt-1 ${m.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
              </p>
              <p className="text-[9px] text-slate-700 mt-2">Ver detalhes →</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-600 mt-2">Baseado nos recorrentes ativos + lançamentos pendentes</p>
      </div>

      {selected && <PersonProjectionPopup month={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
