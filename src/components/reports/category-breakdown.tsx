'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { CategoryTrend } from '@/app/actions/reports'

interface Props {
  categories: CategoryTrend[]
  totalExpense: number
}

export function CategoryBreakdown({ categories, totalExpense }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? categories : categories.slice(0, 6)

  if (categories.length === 0) {
    return <p className="text-sm text-slate-600 py-4 text-center">Sem despesas no período.</p>
  }

  const maxTotal = categories[0]?.total ?? 1

  return (
    <div className="flex flex-col gap-1">
      {visible.map((cat) => {
        const barW = Math.round((cat.total / maxTotal) * 100)

        return (
          <div key={cat.categoryId} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-ink-700/40 transition-colors group">
            {/* Icon */}
            <span className="text-base w-6 text-center shrink-0 leading-none">{cat.icon}</span>

            {/* Name + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300 truncate">{cat.name}</span>
                <span className="text-xs text-slate-500 tabular-nums ml-2 shrink-0">{cat.pct}%</span>
              </div>
              <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${barW}%`, backgroundColor: cat.color }}
                />
              </div>
            </div>

            {/* Amount */}
            <span className="text-sm font-semibold text-slate-200 tabular-nums shrink-0 w-24 text-right">
              {formatCurrency(cat.total)}
            </span>

            {/* Delta badge */}
            <div className="w-14 shrink-0 flex justify-end">
              {cat.delta !== null ? (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ${
                  cat.delta > 0
                    ? 'bg-danger/15 text-danger'
                    : cat.delta < 0
                    ? 'bg-success/15 text-success'
                    : 'bg-ink-600 text-slate-500'
                }`}>
                  {cat.delta > 0 ? <TrendingUp className="size-2.5" /> : cat.delta < 0 ? <TrendingDown className="size-2.5" /> : <Minus className="size-2.5" />}
                  {cat.delta > 0 ? '+' : ''}{cat.delta}%
                </span>
              ) : (
                <span className="text-[10px] text-slate-600">—</span>
              )}
            </div>
          </div>
        )
      })}

      {categories.length > 6 && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors py-2 px-2 self-start"
        >
          <ChevronDown className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Ver menos' : `Ver mais ${categories.length - 6} categorias`}
        </button>
      )}

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-ink-700 mt-1 px-2">
        <span className="text-xs text-slate-500">Total de despesas</span>
        <span className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(totalExpense)}</span>
      </div>
    </div>
  )
}
