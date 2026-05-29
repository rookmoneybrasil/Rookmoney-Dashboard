import { Banknote, RefreshCw, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { IncomeSourceModal } from '@/components/income/income-source-modal'
import { RegisterReceiptModal } from '@/components/income/register-receipt-modal'
import { DeleteIncomeSourceButton } from '@/components/ui/delete-buttons'

const TYPE_CONFIG = {
  EMPLOYMENT: { label: 'CLT / PJ',  icon: '💼', variant: 'brand'   as const },
  FREELANCE:  { label: 'Freelance', icon: '🧑‍💻', variant: 'default' as const },
  RENTAL:     { label: 'Aluguel',   icon: '🏠', variant: 'default' as const },
  OTHER:      { label: 'Outro',     icon: '💡', variant: 'default' as const },
}

export default async function IncomePage() {
  const [sources, categories] = await Promise.all([serverApi.incomeSources(), serverApi.categories()])

  const recurring    = sources.filter((s) => s.isRecurring)
  const nonRecurring = sources.filter((s) => !s.isRecurring)
  const monthlyTotal = recurring.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Rendas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {sources.length} fonte{sources.length !== 1 ? 's' : ''} cadastrada{sources.length !== 1 ? 's' : ''}
          </p>
        </div>
        <IncomeSourceModal categories={categories} />
      </div>

      {/* Summary */}
      {recurring.length > 0 && (
        <Card variant="elevated" padding="sm">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-brand">
              <Banknote className="size-5 text-white" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500">Renda mensal recorrente</span>
              <span className="text-xl font-bold text-slate-100 tabular-nums">{formatCurrency(monthlyTotal)}</span>
            </div>
          </div>
        </Card>
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

      {/* Recurring */}
      {recurring.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="size-3.5" />
            Recorrentes
          </h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {recurring.map((source) => {
                  const cfg = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
                  return (
                    <div key={source.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-ink-600/20 transition-colors">
                      <div className="size-10 rounded-xl bg-brand-900/60 flex items-center justify-center text-xl shrink-0">
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {source.dayOfMonth ? `Todo dia ${source.dayOfMonth}` : 'Mensal'}
                          {source.notes ? ` · ${source.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-success tabular-nums">
                          {formatCurrency(source.amount)}
                        </span>
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <IncomeSourceModal source={source} categories={categories} />
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
      )}

      {/* Non-recurring */}
      {nonRecurring.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Zap className="size-3.5" />
            Eventuais
          </h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {nonRecurring.map((source) => {
                  const cfg = TYPE_CONFIG[source.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.OTHER
                  return (
                    <div key={source.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-ink-600/20 transition-colors">
                      <div className="size-10 rounded-xl bg-ink-700 flex items-center justify-center text-xl shrink-0">
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{source.name}</p>
                          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                        </div>
                        {source.notes && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{source.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-success tabular-nums">
                          {formatCurrency(source.amount)}
                        </span>
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <RegisterReceiptModal source={source} categories={categories} />
                          <IncomeSourceModal source={source} categories={categories} />
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
      )}
    </div>
  )
}
