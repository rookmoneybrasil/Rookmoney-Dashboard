import { Banknote, RefreshCw, Zap, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { IncomeSourceModal } from '@/components/income/income-source-modal'
import { IncomeSourcesLists } from '@/components/income/income-sources-lists'
import { IncomeHistory } from '@/components/income/income-history'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function IncomePage() {
  const [sources, categories, history] = await Promise.all([
    serverApi.incomeSources(),
    serverApi.categories(),
    serverApi.incomeHistory().catch(() => ({} as Awaited<ReturnType<typeof serverApi.incomeHistory>>)),
  ])

  const now          = new Date()
  const currentMonth = format(now, 'yyyy-MM')

  const recurring    = sources.filter((s) =>  s.isRecurring)
  const nonRecurring = sources.filter((s) => !s.isRecurring)
  const eventualPending = nonRecurring.filter((s) => s.lastAutoPayMonth === null)

  const totalRecorrente = recurring.reduce((s, r) => s + Number(r.amount), 0)
  const totalEventual   = nonRecurring.reduce((s, r) => s + Number(r.amount), 0)
  const totalGeral      = totalRecorrente + totalEventual

  // Projeção de receitas: próximos 3 meses
  const projection = Array.from({ length: 3 }, (_, i) => {
    const d  = addMonths(now, i)
    const yr = d.getFullYear()
    const mo = d.getMonth()
    const label = format(d, "MMM/yy", { locale: ptBR })

    // Recorrentes ativos nesse mês (respeitando startDate)
    const recAmount = recurring
      .filter(s => {
        if (!s.startDate) return true
        const sd = new Date(s.startDate)
        return sd.getFullYear() < yr || (sd.getFullYear() === yr && sd.getMonth() <= mo)
      })
      .reduce((s, r) => s + Number(r.amount), 0)

    // Eventuais que ainda nunca foram recebidos
    const evAmount = i === 0
      ? nonRecurring.filter(s => s.lastAutoPayMonth === null).reduce((s, r) => s + Number(r.amount), 0)
      : 0

    return { label, recAmount, evAmount, total: recAmount + evAmount, isCurrent: i === 0 }
  })

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-black text-brand-400 capitalize tracking-tight leading-none mb-1">
            {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <h1 className="text-xl font-semibold text-slate-100">Rendas</h1>
          <p className="text-sm text-slate-500">
            {sources.length} fonte{sources.length !== 1 ? 's' : ''} cadastrada{sources.length !== 1 ? 's' : ''}
          </p>
        </div>
        <IncomeSourceModal categories={categories} />
      </div>

      {/* Summary */}
      {sources.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><RefreshCw className="size-3" /> Recorrente</div>
              <span className="text-lg font-bold text-slate-100 tabular-nums">{formatCurrency(totalRecorrente)}</span>
              <span className="text-xs text-slate-600">{recurring.length} fonte{recurring.length !== 1 ? 's' : ''}</span>
            </div>
          </Card>
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><Zap className="size-3" /> Eventual</div>
              <span className="text-lg font-bold text-slate-100 tabular-nums">{formatCurrency(totalEventual)}</span>
              <span className="text-xs text-slate-600">{nonRecurring.length} fonte{nonRecurring.length !== 1 ? 's' : ''}</span>
            </div>
          </Card>
          <Card variant="elevated" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><Banknote className="size-3" /> Total</div>
              <span className="text-lg font-bold text-success tabular-nums">{formatCurrency(totalGeral)}</span>
              <span className="text-xs text-slate-600">{sources.length} fontes</span>
            </div>
          </Card>
        </div>
      )}

      {sources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="size-12 rounded-xl bg-ink-700 flex items-center justify-center text-slate-600">
            <Banknote className="size-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Nenhuma fonte cadastrada</p>
            <p className="text-slate-600 text-xs mt-1">Adicione seu emprego, freelas ou outros rendimentos.</p>
          </div>
        </div>
      )}

      {/* ── Projeção (topo) ─────────────────────────────────── */}
      {sources.length > 0 && (
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="size-4 text-success" />
            <h3 className="text-sm font-semibold text-slate-300">Projeção de receitas</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {projection.map((m) => (
              <div key={m.label} className={`rounded-lg p-3 border ${m.isCurrent ? 'border-success/30 bg-success/5' : 'border-ink-600 bg-ink-700/50'}`}>
                <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                  {m.isCurrent && <span className="size-1.5 rounded-full bg-success inline-block" />}
                  {m.label}
                </p>
                <p className="text-sm font-bold text-success mb-1.5">+{formatCurrency(m.total)}</p>
                <div className="flex flex-col gap-0.5">
                  {m.recAmount > 0 && <p className="text-[10px] text-slate-600">🔁 {formatCurrency(m.recAmount)} fixas</p>}
                  {m.evAmount > 0  && <p className="text-[10px] text-slate-600">⚡ {formatCurrency(m.evAmount)} eventuais</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">Recorrentes confirmadas + eventuais pendentes deste mês.</p>
        </div>
      )}

      {/* ── Blocos horizontais: Recorrentes | Eventuais ──────── */}
      {sources.length > 0 && (
        <>
          <div className="border-t border-white/6" />
          <IncomeSourcesLists sources={sources} categories={categories} currentMonth={currentMonth} now={now.toISOString()} />
        </>
      )}

      {/* Divisor antes do histórico */}
      {sources.length > 0 && <div className="border-t border-white/6" />}

      {/* Histórico */}
      <IncomeHistory
        sources={sources.map((s) => ({ id: s.id, name: s.name, isRecurring: s.isRecurring, lastAutoPayMonth: s.lastAutoPayMonth }))}
        history={history}
        currentMonth={currentMonth}
      />
    </div>
  )
}
