'use client'

import { formatCurrency } from '@/lib/utils'
import type { IncomeSource } from '@/app/actions/reports'

export function IncomeSourcesChart({ sources, totalIncome }: { sources: IncomeSource[]; totalIncome: number }) {
  if (sources.length === 0) {
    return <p className="text-sm text-slate-600 py-4 text-center">Sem receitas no período.</p>
  }

  const maxTotal = sources[0]?.total ?? 1

  return (
    <div className="flex flex-col gap-1">
      {sources.map((src) => {
        const barW = Math.round((src.total / maxTotal) * 100)
        return (
          <div key={src.name} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-ink-700/40 transition-colors">
            <span className="text-base w-6 text-center shrink-0 leading-none">{src.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300 truncate">{src.name}</span>
                <span className="text-xs text-slate-500 ml-2 shrink-0">{src.pct}%</span>
              </div>
              <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-500 bg-success/70"
                  style={{ width: `${barW}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-semibold text-success tabular-nums shrink-0 w-24 text-right">
              +{formatCurrency(src.total)}
            </span>
          </div>
        )
      })}

      <div className="flex items-center justify-between pt-3 border-t border-ink-700 mt-1 px-2">
        <span className="text-xs text-slate-500">Total de receitas</span>
        <span className="text-sm font-semibold text-success tabular-nums">+{formatCurrency(totalIncome)}</span>
      </div>
    </div>
  )
}
