import { Banknote, RefreshCw, Zap, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { IncomeSourceModal } from '@/components/income/income-source-modal'
import { RegisterReceiptModal } from '@/components/income/register-receipt-modal'
import { DeleteIncomeSourceButton } from '@/components/ui/delete-buttons'
import { IncomeHistory } from '@/components/income/income-history'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TYPE_CONFIG = {
  EMPLOYMENT: { label: 'CLT / PJ',  icon: '💼', variant: 'brand'   as const },
  FREELANCE:  { label: 'Freelance', icon: '🧑‍💻', variant: 'default' as const },
  RENTAL:     { label: 'Aluguel',   icon: '🏠', variant: 'default' as const },
  OTHER:      { label: 'Outro',     icon: '💡', variant: 'default' as const },
}

function receivedDateLabel(source: { isRecurring: boolean; dayOfMonth: number | null; lastAutoPayMonth: string | null }): string {
  if (!source.lastAutoPayMonth) return '—'
  if (source.isRecurring && source.dayOfMonth) {
    const [y, m] = source.lastAutoPayMonth.split('-').map(Number)
    return format(new Date(y, m - 1, source.dayOfMonth), "dd 'de' MMM", { locale: ptBR })
  }
  const [y, m] = source.lastAutoPayMonth.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM yyyy', { locale: ptBR })
}

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Recorrentes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-success shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <RefreshCw className="size-4 text-success" /> Recorrentes
                {totalRecorrente > 0 && (
                  <span className="text-xs font-normal text-slate-500">{formatCurrency(totalRecorrente)}/mês</span>
                )}
              </h2>
            </div>
            <div className="bg-success/5 border border-success/20 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
              💰 <strong className="text-slate-300">Recorrentes</strong> são lançadas automaticamente no dia configurado — aparece <strong className="text-slate-300">A receber</strong> até o dia chegar.
            </div>
            {recurring.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
                <p className="text-xs text-slate-600">Nenhuma renda recorrente</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recurring.map((source) => {
                  const cfg      = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
                  const received = source.lastAutoPayMonth === currentMonth
                  const isFuture = source.startDate && new Date(source.startDate) > now
                  const startLabel = isFuture ? format(new Date(source.startDate!), "MMMM 'de' yyyy", { locale: ptBR }) : null

                  return (
                    <div key={source.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors group ${
                      received  ? 'bg-success/5 border-success/20 opacity-70'
                      : isFuture ? 'bg-ink-800/50 border-ink-700/50 opacity-50'
                      : 'bg-success/5 border-success/15 hover:bg-success/8'
                    }`}>
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-base ${received ? 'bg-success/15' : 'bg-success/10'}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                          {isFuture  && <Badge variant="default" size="sm" dot>Começa em {startLabel}</Badge>}
                          {!isFuture && received  && <Badge variant="success" size="sm" dot>Recebido</Badge>}
                          {!isFuture && !received && <Badge variant="warning" size="sm" dot>A receber</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="text-success font-medium">+{formatCurrency(source.amount)}/mês</span>
                          {source.dayOfMonth && ` · dia ${source.dayOfMonth}`}
                          {received && ` · ${receivedDateLabel(source)}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <IncomeSourceModal source={source} categories={categories} disabled={!!received} />
                        <DeleteIncomeSourceButton id={source.id} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Eventuais */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-warning shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Zap className="size-4 text-warning" /> Eventuais
                {totalEventual > 0 && (
                  <span className="text-xs font-normal text-slate-500">{formatCurrency(totalEventual)}</span>
                )}
              </h2>
            </div>
            <div className="bg-warning/5 border border-warning/20 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
              ⚡ <strong className="text-slate-300">Eventuais</strong> ficam aguardando até você clicar em <strong className="text-slate-300">Recebi</strong> — gera a transação na data informada.
            </div>
            {eventualPending.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
                <p className="text-xs text-slate-600">Nenhuma renda eventual pendente</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {eventualPending.map((source) => {
                  const cfg = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
                  return (
                    <div key={source.id} className="flex items-center gap-3 p-3.5 rounded-xl border bg-warning/5 border-warning/15 hover:bg-warning/8 transition-colors group">
                      <div className="size-8 rounded-lg flex items-center justify-center shrink-0 text-base bg-warning/10">
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          <span className="text-success font-medium">+{formatCurrency(source.amount)}</span>
                          {source.notes ? ` · ${source.notes}` : ' · Pontual'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <RegisterReceiptModal source={source} categories={categories} />
                        <div className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <IncomeSourceModal source={source} categories={categories} />
                          <DeleteIncomeSourceButton id={source.id} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          </div>
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
