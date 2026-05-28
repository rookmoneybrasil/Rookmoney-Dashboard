'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Sparkles, X, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { MonthProjection, ProjectionItem } from '@/lib/api-client'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return formatCurrency(n) }
function fmtCompact(n: number) { return formatCurrency(n, true) }

function ItemList({ items, color }: { items: ProjectionItem[]; color: 'income' | 'expense' }) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-ink-700/40 transition-colors">
          <span className="text-base shrink-0 w-6 text-center leading-none">{item.icon ?? '•'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate">{item.label}</p>
            {item.sublabel && <p className="text-xs text-slate-500 truncate">{item.sublabel}</p>}
          </div>
          <span className={`text-sm font-semibold tabular-nums shrink-0 ${color === 'income' ? 'text-success' : 'text-danger'}`}>
            {color === 'income' ? '+' : '-'}{fmt(item.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function DetailPanel({ proj, onClose }: { proj: MonthProjection; onClose: () => void }) {
  const isPositive = proj.cumulativeBalance >= 0
  const maxBar     = Math.max(proj.income, proj.expense, 1)
  const incPct     = Math.round((proj.income  / maxBar) * 100)
  const expPct     = Math.round((proj.expense / maxBar) * 100)

  const allIncome   = [...proj.incomeItems.sources, ...proj.incomeItems.recurring, ...proj.incomeItems.people]
  const allExpenses = [...proj.expenseItems.bills, ...proj.expenseItems.recurring, ...proj.expenseItems.people]

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-slate-500 capitalize">{proj.label} · Saldo acumulado</p>
            <p className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-success' : 'text-danger'}`}>
              {fmt(proj.cumulativeBalance)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="size-3.5 text-success" />
              <span className="text-slate-500">Entra este mês:</span>
              <span className="text-success font-semibold tabular-nums">+{fmt(proj.income)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowDownRight className="size-3.5 text-danger" />
              <span className="text-slate-500">Sai este mês:</span>
              <span className="text-danger font-semibold tabular-nums">-{fmt(proj.expense)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 ml-5">Resultado mensal:</span>
              <span className={`font-semibold tabular-nums ${proj.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {proj.balance >= 0 ? '+' : ''}{fmt(proj.balance)}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Bars */}
      <div className="px-5 py-4 flex flex-col gap-2.5 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 shrink-0 text-right">Receita</span>
          <div className="flex-1 h-4 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-4 rounded-full bg-success/80 transition-all duration-500" style={{ width: `${incPct}%` }} />
          </div>
          <span className="text-sm font-semibold text-success tabular-nums w-28 text-right shrink-0">+{fmt(proj.income)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 shrink-0 text-right">Despesa</span>
          <div className="flex-1 h-4 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-4 rounded-full bg-danger/80 transition-all duration-500" style={{ width: `${expPct}%` }} />
          </div>
          <span className="text-sm font-semibold text-danger tabular-nums w-28 text-right shrink-0">-{fmt(proj.expense)}</span>
        </div>
      </div>

      {/* Item breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-700">
        <div className="px-3 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
            <TrendingUp className="size-3 text-success" />
            Receitas — {fmt(proj.income)}
          </p>
          {allIncome.length === 0 ? (
            <p className="text-xs text-slate-600 px-3">Nenhuma receita projetada</p>
          ) : (
            <>
              {proj.incomeItems.sources.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">Rendas recorrentes</p>
                  <ItemList items={proj.incomeItems.sources} color="income" />
                </div>
              )}
              {proj.incomeItems.recurring.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">Recorrências</p>
                  <ItemList items={proj.incomeItems.recurring} color="income" />
                </div>
              )}
              {proj.incomeItems.people.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">A receber de pessoas</p>
                  <ItemList items={proj.incomeItems.people} color="income" />
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-3 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
            <TrendingDown className="size-3 text-danger" />
            Despesas — {fmt(proj.expense)}
          </p>
          {allExpenses.length === 0 ? (
            <p className="text-xs text-slate-600 px-3">Nenhuma despesa projetada</p>
          ) : (
            <>
              {proj.expenseItems.bills.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">Contas e parcelas</p>
                  <ItemList items={proj.expenseItems.bills} color="expense" />
                </div>
              )}
              {proj.expenseItems.recurring.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">Recorrências</p>
                  <ItemList items={proj.expenseItems.recurring} color="expense" />
                </div>
              )}
              {proj.expenseItems.people.length > 0 && (
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wider px-3 mb-1">A pagar para pessoas</p>
                  <ItemList items={proj.expenseItems.people} color="expense" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Month chip ───────────────────────────────────────────────────────────────

function MonthChip({
  proj, maxCumulative, minCumulative, selected, onClick,
}: {
  proj:           MonthProjection
  maxCumulative:  number
  minCumulative:  number
  selected:       boolean
  onClick:        () => void
}) {
  const isPositive = proj.cumulativeBalance >= 0
  const range = Math.max(maxCumulative - minCumulative, 1)

  // Bar height for the cumulative balance (normalized 4–72px)
  const normalized = (proj.cumulativeBalance - minCumulative) / range
  const barH = Math.round(4 + normalized * 68)

  // Monthly delta indicator
  const delta = proj.balance

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-150 min-w-[110px] ${
        selected
          ? 'bg-ink-700 border-brand-500 shadow-sm shadow-brand-900/50'
          : 'bg-ink-800 border-ink-700 hover:border-ink-500 hover:bg-ink-750'
      }`}
    >
      {/* Cumulative balance bar */}
      <div className="flex items-end justify-center h-[76px] w-full">
        <div
          className={`w-8 rounded-t-md transition-all duration-300 ${isPositive ? 'bg-brand-600' : 'bg-danger/60'}`}
          style={{ height: barH }}
        />
      </div>

      {/* Month label */}
      <p className="text-xs font-medium text-slate-400 capitalize">{proj.label}</p>

      {/* Cumulative balance — the main number */}
      <p className={`text-sm font-bold tabular-nums ${isPositive ? 'text-slate-100' : 'text-danger'}`}>
        {fmtCompact(proj.cumulativeBalance)}
      </p>

      {/* Monthly delta — small secondary */}
      <p className={`text-xs tabular-nums ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
        {delta >= 0 ? '↑' : '↓'}{fmtCompact(Math.abs(delta))}
      </p>
    </button>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface Props {
  projections: MonthProjection[]
}

export function ProjectionsSection({ projections }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const selectedProj = projections.find(p => p.month === selected) ?? null

  const hasAny     = projections.some(p => p.income > 0 || p.expense > 0)
  const cumulatives = projections.map(p => p.cumulativeBalance)
  const maxCumulative = Math.max(...cumulatives, 0)
  const minCumulative = Math.min(...cumulatives, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-brand-400" />
        <h2 className="text-sm font-semibold text-slate-300">Projeção dos próximos meses</h2>
        <span className="text-xs text-slate-600 bg-ink-700 px-2 py-0.5 rounded-full border border-ink-600">estimativa</span>
      </div>

      {!hasAny ? (
        <p className="text-sm text-slate-600 py-2">
          Configure rendas recorrentes, contas e recorrências para ver projeções.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-brand-600 inline-block" />
              Saldo acumulado
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-success">↑</span> / <span className="text-danger">↓</span>
              <span>resultado do mês</span>
            </span>
            <span className="text-xs text-slate-600">· Clique para detalhes</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {projections.map(proj => (
              <MonthChip
                key={proj.month}
                proj={proj}
                maxCumulative={maxCumulative}
                minCumulative={minCumulative}
                selected={selected === proj.month}
                onClick={() => setSelected(v => v === proj.month ? null : proj.month)}
              />
            ))}
          </div>

          {selectedProj && (
            <DetailPanel proj={selectedProj} onClose={() => setSelected(null)} />
          )}
        </>
      )}
    </div>
  )
}
