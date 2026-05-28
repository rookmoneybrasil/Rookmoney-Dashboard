import { Suspense } from 'react'
import { BarChart3, TrendingDown, Calendar, Layers } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { ReportsFilters } from '@/components/reports/reports-filters'
import { ReportsExport } from '@/components/reports/reports-export'
import { MonthlyChart } from '@/components/reports/monthly-chart'
import { PeriodKPIs } from '@/components/reports/period-kpis'
import { CategoryBreakdown } from '@/components/reports/category-breakdown'
import { TopExpenses } from '@/components/reports/top-expenses'
import { SpendingPattern } from '@/components/reports/spending-pattern'
import { IncomeSourcesChart } from '@/components/reports/income-sources-chart'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp     = await searchParams
  const months = Math.min(Math.max(Number(sp.months ?? '6'), 1), 24)
  const month  = (sp.month as string) ?? format(new Date(), 'yyyy-MM')

  const data = await serverApi.reports(months)
  const { monthly, period, topExpenses, spendingByDay, categoryTrend, incomeSources } = data

  const periodExpense = period.totalExpense
  const hasData = monthly.length > 0

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto print:gap-3 print:max-w-none">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Relatórios</h1>
          {monthly.length > 0 && (
            <p className="text-sm text-slate-500 mt-0.5 capitalize">
              {monthly[0].monthFull} – {monthly[monthly.length - 1].monthFull}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Suspense>
            <ReportsFilters month={month} months={months} />
          </Suspense>
          <ReportsExport data={monthly} />
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold text-black">Relatório Financeiro — Rook Money</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{monthly[0]?.monthFull} – {monthly[monthly.length - 1]?.monthFull}</p>
      </div>

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!hasData && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
          <div className="size-16 rounded-2xl bg-ink-700 border border-ink-600 flex items-center justify-center text-slate-600">
            <BarChart3 className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-slate-300 font-medium">Nenhum dado para exibir</p>
            <p className="text-slate-600 text-sm max-w-xs leading-relaxed">
              Registre algumas transações para começar a ver gráficos, tendências e insights sobre suas finanças.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI cards + rest of report (only when has data) ────────── */}
      {hasData && (<>
      <div className="print:block print:[&>*]:mb-3">
        <PeriodKPIs period={period} nMonths={months} />
      </div>

      {/* ── Evolução mensal (full width) ──────────────────────────── */}
      <Card>
        <CardHeader className="flex-row items-center gap-2 pb-2">
          <BarChart3 className="size-4 text-brand-400 shrink-0" />
          <CardTitle>Evolução mensal</CardTitle>
          {period.bestMonth && (
            <span className="ml-auto text-xs text-slate-500">
              Melhor mês: <span className="text-success capitalize">{period.bestMonth}</span>
            </span>
          )}
        </CardHeader>
        <CardContent>
          <MonthlyChart data={monthly} />
        </CardContent>
      </Card>

      {/* ── Categorias + Maiores despesas ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:[&>*]:mb-4">
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <Layers className="size-4 text-brand-400 shrink-0" />
            <CardTitle>Gastos por categoria</CardTitle>
            <span className="ml-auto text-xs text-slate-500">variação vs mês anterior</span>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown categories={categoryTrend} totalExpense={periodExpense} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <TrendingDown className="size-4 text-danger shrink-0" />
            <CardTitle>Maiores despesas</CardTitle>
            <span className="ml-auto text-xs text-slate-500">top {topExpenses.length} no período</span>
          </CardHeader>
          <CardContent>
            <TopExpenses expenses={topExpenses} periodExpense={periodExpense} />
          </CardContent>
        </Card>
      </div>

      {/* ── Padrão de gasto + Fontes de receita ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 print:block print:[&>*]:mb-4">
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <Calendar className="size-4 text-brand-400 shrink-0" />
            <CardTitle>Padrão de gasto por dia</CardTitle>
            <span className="ml-auto text-xs text-slate-500">acumulado no período</span>
          </CardHeader>
          <CardContent>
            <SpendingPattern data={spendingByDay} />
            <p className="text-xs text-slate-600 mt-2">
              Dias em vermelho = maiores gastos acumulados. Útil para identificar datas de vencimentos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-2">
            <BarChart3 className="size-4 text-success shrink-0" />
            <CardTitle>Fontes de receita</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeSourcesChart sources={incomeSources} totalIncome={period.totalIncome} />
          </CardContent>
        </Card>
      </div>

      {/* ── Resumo mensal (tabela) ─────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Resumo por mês</CardTitle></CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-sm text-slate-600 py-4 text-center">Sem dados ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6">
                    {['Mês', 'Receitas', 'Despesas', 'Saldo', '% Poupança'].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-0 last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {monthly.map((m) => {
                    const rateColor = m.savingsRate >= 20 ? 'text-success'
                                    : m.savingsRate >= 0  ? 'text-amber-400'
                                    : 'text-danger'
                    return (
                      <tr key={m.monthKey} className="hover:bg-ink-600/20 transition-colors">
                        <td className="py-3 px-3 first:pl-0 text-slate-300 font-medium capitalize">{m.monthFull}</td>
                        <td className="py-3 px-3 text-success tabular-nums">+{formatCurrency(m.totalIncome)}</td>
                        <td className="py-3 px-3 text-danger  tabular-nums">-{formatCurrency(m.totalExpense)}</td>
                        <td className={`py-3 px-3 font-semibold tabular-nums ${m.balance >= 0 ? 'text-slate-200' : 'text-danger'}`}>
                          {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
                        </td>
                        <td className={`py-3 px-3 text-right font-semibold tabular-nums ${rateColor}`}>
                          {m.savingsRate > 0 ? '+' : ''}{m.savingsRate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr className="border-t border-white/10">
                    <td className="py-3 px-3 first:pl-0 text-xs font-semibold text-slate-500 uppercase">Total</td>
                    <td className="py-3 px-3 text-success font-bold tabular-nums">+{formatCurrency(period.totalIncome)}</td>
                    <td className="py-3 px-3 text-danger  font-bold tabular-nums">-{formatCurrency(period.totalExpense)}</td>
                    <td className={`py-3 px-3 font-bold tabular-nums ${period.netBalance >= 0 ? 'text-slate-100' : 'text-danger'}`}>
                      {period.netBalance >= 0 ? '+' : ''}{formatCurrency(period.netBalance)}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold tabular-nums ${
                      period.savingsRate >= 20 ? 'text-success' : period.savingsRate >= 0 ? 'text-amber-400' : 'text-danger'
                    }`}>
                      {period.savingsRate > 0 ? '+' : ''}{period.savingsRate}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </>)}
    </div>
  )
}
