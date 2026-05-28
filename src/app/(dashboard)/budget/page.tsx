import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PiggyBank, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { deleteBudget } from '@/app/actions/budgets'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { serverApi } from '@/lib/api-client'
import { BudgetModal } from '@/components/budget/budget-modal'
import { BudgetMonthPicker } from '@/components/budget/budget-month-picker'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function BudgetPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const month = (sp.month as string) ?? format(new Date(), 'yyyy-MM')

  const [budgets, categories] = await Promise.all([
    serverApi.budget(month),
    serverApi.categories(),
  ])

  const monthLabel = format(new Date(month + '-02'), 'MMMM yyyy', { locale: ptBR })

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent,  0)
  const overBudget  = budgets.filter((b) => b.spent > b.amount)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 capitalize">Orçamento</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <BudgetMonthPicker month={month} />
          <BudgetModal categories={categories} month={month} />
        </div>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500">Orçamento total</span>
              <span className="text-lg font-bold text-slate-200 tabular-nums">{formatCurrency(totalBudget)}</span>
            </div>
          </Card>
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500">Gasto até agora</span>
              <span className={`text-lg font-bold tabular-nums ${totalSpent > totalBudget ? 'text-danger' : 'text-slate-200'}`}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </Card>
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500">Disponível</span>
              <span className={`text-lg font-bold tabular-nums ${totalBudget - totalSpent < 0 ? 'text-danger' : 'text-success'}`}>
                {formatCurrency(Math.abs(totalBudget - totalSpent))}
                {totalBudget - totalSpent < 0 && <span className="text-xs ml-1">acima</span>}
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Budget list */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="size-12 rounded-xl bg-ink-700 flex items-center justify-center text-slate-600">
            <PiggyBank className="size-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Nenhum orçamento definido</p>
            <p className="text-slate-600 text-xs mt-1">Defina limites por categoria para controlar seus gastos.</p>
          </div>
        </div>
      ) : (
        <Card padding="none">
          <CardContent>
            <div className="divide-y divide-white/5">
              {budgets.map((b) => {
                const pct       = b.amount > 0 ? Math.min(Math.round((b.spent / b.amount) * 100), 100) : 0
                const isOver    = b.spent > b.amount
                const isWarning = !isOver && pct >= 80

                return (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-ink-600/20 transition-colors">
                    <div className="size-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: b.category.color + '22', color: b.category.color }}>
                      {b.category.icon}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">{b.category.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {isOver && <Badge variant="danger" size="sm" dot>Acima</Badge>}
                          {isWarning && <Badge variant="warning" size="sm" dot>Atenção</Badge>}
                          <span className="text-xs text-slate-500 tabular-nums">
                            {formatCurrency(b.spent, true)} / {formatCurrency(b.amount, true)}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={b.spent}
                        max={b.amount}
                        variant={isOver ? 'danger' : isWarning ? 'warning' : 'brand'}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <BudgetModal categories={categories} month={month} budget={b} />
                      <ConfirmDeleteButton
                        action={deleteBudget.bind(null, b.id)}
                        label="Excluir orçamento?"
                        title="Excluir orçamento"
                        className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {overBudget.length > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-danger/10 border border-danger/20">
          <TrendingUp className="size-4 text-danger mt-0.5 shrink-0" />
          <p className="text-sm text-danger">
            {overBudget.length} categoria{overBudget.length > 1 ? 's' : ''} acima do orçamento:{' '}
            {overBudget.map((b) => b.category.name).join(', ')}.
          </p>
        </div>
      )}
    </div>
  )
}
