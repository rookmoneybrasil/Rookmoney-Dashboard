'use client'

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { PeriodReport as PeriodStats } from '@/lib/api-client'

function KpiCard({
  label, value, sub, icon: Icon, variant,
}: {
  label:   string
  value:   string
  sub?:    string
  icon:    React.ElementType
  variant: 'income' | 'expense' | 'balance' | 'savings'
}) {
  const styles = {
    income:  { bg: 'bg-success/8  border-success/20',  text: 'text-success',  icon: 'text-success/70'  },
    expense: { bg: 'bg-danger/8   border-danger/20',   text: 'text-danger',   icon: 'text-danger/70'   },
    balance: { bg: 'bg-brand-900  border-brand-700/40', text: 'text-brand-300', icon: 'text-brand-400'  },
    savings: { bg: 'bg-ink-750    border-ink-600',      text: 'text-slate-100', icon: 'text-slate-400'  },
  }[variant]

  return (
    <div className={`rounded-xl border px-4 py-4 flex flex-col gap-3 ${styles.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <Icon className={`size-4 ${styles.icon}`} />
      </div>
      <div>
        <p className={`text-xl font-bold tabular-nums ${styles.text}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function PeriodKPIs({ period, nMonths }: { period: PeriodStats; nMonths: number }) {
  const savingsColor = period.savingsRate >= 20 ? 'text-success'
                     : period.savingsRate >= 0  ? 'text-amber-400'
                     : 'text-danger'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-2 print:gap-2">
      <KpiCard
        label="Receitas no período"
        value={formatCurrency(period.totalIncome)}
        sub={`≈ ${formatCurrency(period.avgMonthlyIncome)}/mês`}
        icon={TrendingUp}
        variant="income"
      />
      <KpiCard
        label="Despesas no período"
        value={formatCurrency(period.totalExpense)}
        sub={`≈ ${formatCurrency(period.avgMonthlyExpense)}/mês`}
        icon={TrendingDown}
        variant="expense"
      />
      <KpiCard
        label="Saldo do período"
        value={formatCurrency(period.netBalance)}
        sub={`${period.positiveMonths}/${period.totalMonths} meses positivos`}
        icon={Wallet}
        variant="balance"
      />
      <div className="rounded-xl border border-ink-600 bg-ink-750 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taxa de poupança</span>
          <PiggyBank className="size-4 text-slate-400" />
        </div>
        <div>
          <p className={`text-xl font-bold tabular-nums ${savingsColor}`}>
            {period.savingsRate > 0 ? '+' : ''}{period.savingsRate}%
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {period.savingsRate >= 20 ? 'Excelente 🎉'
           : period.savingsRate >= 10 ? 'Bom 👍'
           : period.savingsRate >= 0  ? 'Atenção ⚠️'
           : 'Gastos acima da renda 🚨'}
          </p>
        </div>
      </div>
    </div>
  )
}
