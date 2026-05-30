import { formatCurrency } from '@/lib/utils'
import { differenceInDays, parseISO } from 'date-fns'
import Link from 'next/link'
import { Bell, CheckCircle } from 'lucide-react'

interface Bill { id: string; name: string; amount: number; dueDate: string; isPaid: boolean }

interface Props { bills: Bill[] }

export function NextBillHighlight({ bills }: Props) {
  const pending = bills.filter(b => !b.isPaid)
  if (pending.length === 0) {
    return (
      <div className="bg-success/8 border border-success/20 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle className="size-5 text-success shrink-0" />
        <div>
          <p className="text-sm font-medium text-success">Nenhuma conta pendente</p>
          <p className="text-xs text-slate-500 mt-0.5">Tudo em dia por aqui!</p>
        </div>
      </div>
    )
  }

  const next = pending[0]
  const days = differenceInDays(parseISO(next.dueDate.split('T')[0]), new Date())
  const isOverdue  = days < 0
  const isUrgent   = days <= 2 && days >= 0
  const isUpcoming = days <= 7

  const bg    = isOverdue ? 'bg-danger/8 border-danger/25' : isUrgent ? 'bg-amber-400/8 border-amber-400/25' : 'bg-ink-800 border-white/6'
  const color = isOverdue ? 'text-danger' : isUrgent ? 'text-amber-400' : 'text-slate-300'
  const label = isOverdue
    ? `Atrasada há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`
    : days === 0 ? 'Vence hoje!'
    : days === 1 ? 'Vence amanhã'
    : `Vence em ${days} dias`

  return (
    <Link href="/bills" className={`block rounded-2xl border p-4 transition-colors hover:opacity-90 ${bg}`}>
      <div className="flex items-start gap-3">
        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? 'bg-danger/15' : isUrgent ? 'bg-amber-400/15' : 'bg-ink-700'}`}>
          <Bell className={`size-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-200 truncate">{next.name}</p>
            <span className={`text-sm font-bold tabular-nums shrink-0 ${color}`}>
              {formatCurrency(Number(next.amount))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className={`text-xs font-medium ${color}`}>{label}</span>
            {pending.length > 1 && (
              <span className="text-[10px] text-slate-600">+{pending.length - 1} outras</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
