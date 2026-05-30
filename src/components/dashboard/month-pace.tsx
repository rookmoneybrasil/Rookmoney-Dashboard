import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, TrendingDown, CheckCircle } from 'lucide-react'

interface Props {
  income:     number
  expense:    number
  dayOfMonth: number
  daysInMonth: number
}

export function MonthPace({ income, expense, dayOfMonth, daysInMonth }: Props) {
  const timePct    = Math.round((dayOfMonth / daysInMonth) * 100)
  const spendPct   = income > 0 ? Math.round((expense / income) * 100) : 0
  const delta      = spendPct - timePct  // positive = spending faster than time passes
  const daysLeft   = daysInMonth - dayOfMonth

  const status = spendPct > 100
    ? 'over'
    : spendPct > timePct + 15
    ? 'warn'
    : 'ok'

  const colors = {
    over: { bar: 'bg-danger', text: 'text-danger', icon: AlertTriangle },
    warn: { bar: 'bg-amber-400', text: 'text-amber-400', icon: TrendingDown },
    ok:   { bar: 'bg-success',  text: 'text-success',  icon: CheckCircle },
  }
  const c = colors[status]
  const Icon = c.icon

  return (
    <div className="bg-ink-800 border border-white/6 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 shrink-0 ${c.text}`} />
          <p className="text-sm font-medium text-slate-200">Ritmo do mês</p>
        </div>
        <span className="text-xs text-slate-500">dia {dayOfMonth}/{daysInMonth}</span>
      </div>

      {/* Dual progress bars */}
      <div className="flex flex-col gap-1.5">
        {/* Time progress */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 w-12 shrink-0 text-right">Tempo</span>
          <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${timePct}%` }} />
          </div>
          <span className="text-[10px] text-slate-500 w-7 text-right">{timePct}%</span>
        </div>
        {/* Spending progress */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-600 w-12 shrink-0 text-right">Gastos</span>
          <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${Math.min(spendPct, 100)}%` }} />
          </div>
          <span className={`text-[10px] font-medium w-7 text-right ${c.text}`}>{spendPct}%</span>
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-snug">
        {status === 'over'
          ? `Você já gastou ${formatCurrency(expense - income)} a mais do que recebeu.`
          : status === 'warn'
          ? `Ritmo ${delta}% acima do esperado. Faltam ${daysLeft} dias.`
          : `No ritmo certo. ${formatCurrency(income - expense)} disponíveis.`}
      </p>
    </div>
  )
}
