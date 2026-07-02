import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PiggyBank, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { BudgetModal } from '@/components/budget/budget-modal'
import { BudgetList } from '@/components/budget/budget-list'
import { BudgetMonthPicker } from '@/components/budget/budget-month-picker'
import { ProGate } from '@/components/ui/pro-gate'
import { isPro } from '@/lib/plans'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function BudgetPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const month = (sp.month as string) ?? format(new Date(), 'yyyy-MM')

  const user = await serverApi.me()
  if (!isPro(user.plan)) {
    return (
      <ProGate feature="Orçamento por categoria" locked>
        <div className="h-96 rounded-xl bg-ink-800 border border-white/6" />
      </ProGate>
    )
  }

  const [budgets, categories] = await Promise.all([
    serverApi.budget(month),
    serverApi.categories(),
  ])

  const monthLabel = format(new Date(month + '-02'), 'MMMM yyyy', { locale: ptBR })

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent,  0)
  const overBudget  = budgets.filter((b) => b.spent > Number(b.amount))

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 capitalize">Orçamento</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthLabel}</p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Defina um limite de gasto por categoria para cada mês. Você recebe alertas quando se aproximar ou ultrapassar o limite.</p>
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
        <BudgetList budgets={budgets} categories={categories} month={month} />
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
