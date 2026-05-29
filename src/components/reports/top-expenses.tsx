'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import type { TopExpense } from '@/lib/api-client'

export function TopExpenses({ expenses, periodExpense }: { expenses: TopExpense[]; periodExpense: number }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-slate-600 py-4 text-center">Sem despesas no período.</p>
  }

  const maxAmt = expenses[0]?.amount ?? 1

  return (
    <div className="flex flex-col gap-1">
      {expenses.map((exp, idx) => {
        const barW = Math.round((exp.amount / maxAmt) * 100)
        const pct  = periodExpense > 0 ? Math.round((exp.amount / periodExpense) * 100) : 0

        return (
          <div key={exp.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-ink-700/40 transition-colors">
            {/* Rank */}
            <span className="text-xs font-bold text-slate-600 w-4 shrink-0 tabular-nums text-center">
              {idx + 1}
            </span>

            {/* Icon */}
            <span className="text-base w-6 text-center shrink-0 leading-none">{exp.category.icon}</span>

            {/* Description + bar */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{exp.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 h-1 bg-ink-700 rounded-full overflow-hidden">
                  <div
                    className="h-1 rounded-full transition-all duration-500 bg-danger/60"
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-600 shrink-0">
                  {format(new Date(exp.date), "dd 'de' MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>

            {/* Amount + pct */}
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(exp.amount)}</p>
              <p className="text-[10px] text-slate-600 tabular-nums">{pct}% do total</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
