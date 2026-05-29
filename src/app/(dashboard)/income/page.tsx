import { Banknote, RefreshCw, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { IncomeSourceModal } from '@/components/income/income-source-modal'
import { RegisterReceiptModal } from '@/components/income/register-receipt-modal'
import { DeleteIncomeSourceButton } from '@/components/ui/delete-buttons'
import { IncomeHistory } from '@/components/income/income-history'
import { format } from 'date-fns'
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
    const d = new Date(y, m - 1, source.dayOfMonth)
    return format(d, "dd 'de' MMM", { locale: ptBR })
  }
  // Eventual: only month known
  const [y, m] = source.lastAutoPayMonth.split('-').map(Number)
  return format(new Date(y, m - 1, 1), 'MMM yyyy', { locale: ptBR })
}

export default async function IncomePage() {
  const [sources, categories, history] = await Promise.all([
    serverApi.incomeSources(),
    serverApi.categories(),
    serverApi.incomeHistory().catch(() => ({} as Awaited<ReturnType<typeof serverApi.incomeHistory>>)),
  ])

  const currentMonth = format(new Date(), 'yyyy-MM')

  const recurring    = sources.filter((s) =>  s.isRecurring)
  const nonRecurring = sources.filter((s) => !s.isRecurring)

  // Recurring: always show all, just mark received ones
  const recurringActive  = recurring  // all recurring always visible
  const eventualPending  = nonRecurring.filter((s) => s.lastAutoPayMonth !== currentMonth)

  const totalRecorrente = recurring.reduce((s, r) => s + Number(r.amount), 0)
  const totalEventual   = nonRecurring.reduce((s, r) => s + Number(r.amount), 0)
  const totalGeral      = totalRecorrente + totalEventual

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-slate-100">Rendas</h1>
          <p className="text-sm text-slate-500">
            {sources.length} fonte{sources.length !== 1 ? 's' : ''} cadastrada{sources.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mt-0.5">
            Cadastre suas fontes de renda — salário, freelas, aluguéis e outras. Fontes <strong className="text-slate-500">recorrentes</strong> são lançadas automaticamente todo mês na data configurada. Fontes <strong className="text-slate-500">eventuais</strong> ficam pendentes até você clicar em <strong className="text-slate-500">Recebi</strong>, gerando a transação na data informada.
          </p>
        </div>
        <IncomeSourceModal categories={categories} />
      </div>

      {/* 3 summary cards */}
      {sources.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <RefreshCw className="size-3" />
                Recorrente
              </div>
              <span className="text-lg font-bold text-slate-100 tabular-nums">{formatCurrency(totalRecorrente)}</span>
              <span className="text-xs text-slate-600">{recurring.length} fonte{recurring.length !== 1 ? 's' : ''}</span>
            </div>
          </Card>
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Zap className="size-3" />
                Eventual
              </div>
              <span className="text-lg font-bold text-slate-100 tabular-nums">{formatCurrency(totalEventual)}</span>
              <span className="text-xs text-slate-600">{nonRecurring.length} fonte{nonRecurring.length !== 1 ? 's' : ''}</span>
            </div>
          </Card>
          <Card variant="elevated" padding="sm">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Banknote className="size-3" />
                Total
              </div>
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

      {/* Recurring — always visible, with received indicator */}
      {recurringActive.length > 0 && (
        <IncomeSection
          title="Recorrentes"
          icon={<RefreshCw className="size-3.5" />}
          sources={recurringActive}
          categories={categories}
          showReceive={false}
          currentMonth={currentMonth}
        />
      )}

      {/* Eventuais — pending */}
      {eventualPending.length > 0 && (
        <IncomeSection
          title="Eventuais"
          icon={<Zap className="size-3.5" />}
          sources={eventualPending}
          categories={categories}
          showReceive
        />
      )}

      {/* Unified payment history — all sources, collapsible */}
      <IncomeHistory
        sources={sources.map((s) => ({ id: s.id, name: s.name, isRecurring: s.isRecurring, lastAutoPayMonth: s.lastAutoPayMonth }))}
        history={history}
        currentMonth={currentMonth}
      />
    </div>
  )
}

function IncomeSection({
  title, icon, sources, categories, showReceive, currentMonth,
}: {
  title: string
  icon: React.ReactNode
  sources: Awaited<ReturnType<typeof serverApi.incomeSources>>
  categories: Awaited<ReturnType<typeof serverApi.categories>>
  showReceive: boolean
  currentMonth?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        {icon}{title}
      </h2>
      <Card padding="none">
        <CardContent>
          <div className="divide-y divide-white/5">
            {sources.map((source) => {
              const cfg       = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
              const received  = currentMonth && source.lastAutoPayMonth === currentMonth
              return (
                <div key={source.id} className={`flex items-center gap-4 px-5 py-4 group hover:bg-ink-600/20 transition-colors ${received ? 'opacity-60' : ''}`}>
                  <div className={`size-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${received ? 'bg-success/10' : 'bg-brand-900/60'}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                      {received && <Badge variant="success" size="sm" dot>Recebido este mês</Badge>}
                      {!received && !showReceive && <Badge variant="warning" size="sm" dot>A receber</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {source.isRecurring
                        ? source.dayOfMonth
                          ? received
                            ? `Recebido em ${receivedDateLabel(source)} · Repete dia ${source.dayOfMonth}`
                            : `Todo dia ${source.dayOfMonth}`
                          : 'Mensal'
                        : source.notes ?? ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-success tabular-nums">
                      {formatCurrency(source.amount)}
                    </span>
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {showReceive && (
                        <RegisterReceiptModal source={source} categories={categories} />
                      )}
                      <IncomeSourceModal
                        source={source}
                        categories={categories}
                        disabled={!!received}
                        {...(received && {
                          className: "size-8 rounded-lg flex items-center justify-center text-danger/70 hover:text-danger hover:bg-danger/10 transition-colors",
                          title: "Já recebido este mês — edições valem a partir do próximo mês",
                        })}
                      />
                      <DeleteIncomeSourceButton id={source.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
