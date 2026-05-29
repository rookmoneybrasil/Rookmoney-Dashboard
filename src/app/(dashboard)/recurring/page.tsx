import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { serverApi, type RecurringTransaction, type Category } from '@/lib/api-client'
import { DeleteRecurringButton, ToggleRecurringButton } from '@/components/ui/delete-buttons'
import { RecurringModal } from '@/components/recurring/recurring-modal'

const freqLabel: Record<string, string> = {
  MONTHLY: 'Mensal',
  WEEKLY:  'Semanal',
  YEARLY:  'Anual',
}

export default async function RecurringPage() {
  const [items, categories] = await Promise.all([
    serverApi.recurring(),
    serverApi.categories(),
  ])

  const active   = items.filter((r) => r.isActive)
  const inactive = items.filter((r) => !r.isActive)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Recorrências</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {active.length} ativa{active.length !== 1 ? 's' : ''} · {inactive.length} inativa{inactive.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Transações recorrentes são lançadas automaticamente todo mês na data configurada — despesas fixas como aluguel, internet ou assinaturas.</p>
        </div>
        <RecurringModal categories={categories} />
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <RefreshCw className="size-10 text-slate-700" />
          <p className="text-slate-500 text-sm">Nenhuma recorrência cadastrada.</p>
          <p className="text-slate-600 text-xs">Use o botão acima para criar sua primeira transação recorrente.</p>
        </div>
      )}

      {/* Active */}
      {active.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ativas</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {active.map((rec) => (
                  <RecurringRow key={rec.id} rec={rec} categories={categories} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inativas</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5 opacity-60">
                {inactive.map((rec) => (
                  <RecurringRow key={rec.id} rec={rec} categories={categories} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function RecurringRow({
  rec,
  categories,
}: {
  rec: RecurringTransaction
  categories: Category[]
}) {
  const isIncome = rec.type === 'INCOME'

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-ink-600/30 transition-colors group">
      {/* Icon */}
      <div
        className="size-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
        style={{ backgroundColor: rec.category.color + '22', color: rec.category.color }}
      >
        {rec.category.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-slate-200 truncate">{rec.name}</p>
          <Badge variant={isIncome ? 'success' : 'default'} size="sm">
            {isIncome ? (
              <TrendingUp className="size-3 inline mr-1" />
            ) : (
              <TrendingDown className="size-3 inline mr-1" />
            )}
            {isIncome ? 'Receita' : 'Despesa'}
          </Badge>
          <Badge variant="outline" size="sm">{freqLabel[rec.frequency] ?? rec.frequency}</Badge>
          {rec.frequency === 'MONTHLY' && rec.dayOfMonth && (
            <span className="text-xs text-slate-600">dia {rec.dayOfMonth}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {rec.category.icon} {rec.category.name}
          {rec.description ? ` · ${rec.description}` : ''}
        </p>
      </div>

      {/* Amount */}
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          isIncome ? 'text-success' : 'text-slate-300'
        }`}
      >
        {isIncome ? '+' : '-'}{formatCurrency(rec.amount)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <ToggleRecurringButton id={rec.id} isActive={rec.isActive} />

        <RecurringModal categories={categories} item={rec} />

        <DeleteRecurringButton id={rec.id} />
      </div>
    </div>
  )
}
