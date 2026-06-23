import { Suspense } from 'react'
import Link from 'next/link'
import { WelcomeProModal } from '@/components/ui/welcome-pro-modal'
import { UpsellModal } from '@/components/ui/upsell-modal'
import { ProjectionsSection } from '@/components/dashboard/projections-section'
import { FinancialHealthCard } from '@/components/dashboard/financial-health-card'
import { DashboardGreeting } from '@/components/dashboard/greeting'
import { MonthPace } from '@/components/dashboard/month-pace'
import { NextBillHighlight } from '@/components/dashboard/next-bill-highlight'
import { CategoryDonut } from '@/components/dashboard/category-donut'
import { isPro as checkIsPro } from '@/lib/plans'
import { RookinhoInsight } from '@/components/dashboard/rookinho-insight'
import { DashboardKPIs } from '@/components/dashboard/stat-card-modals'
import { ThemedBillCard } from '@/components/dashboard/themed-bill-card'
import { format } from 'date-fns'
import { ptBR, enUS, es as esLocale } from 'date-fns/locale'
import { getTranslations, getLocale } from 'next-intl/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { WithTooltip } from '@/components/ui/tooltip'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { getServiceBrand } from '@/lib/service-brands'
import type { MascotMood } from '@/lib/mascot'
import { serverApi } from '@/lib/api-client'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest px-1">{children}</p>
  )
}

export default async function DashboardPage() {
  const [t, locale] = await Promise.all([
    getTranslations('dashboard'),
    getLocale(),
  ])
  const dateLocale = locale === 'en' ? enUS : locale === 'es' ? esLocale : ptBR

  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const [data, budgets, me] = await Promise.all([
    serverApi.dashboard(),
    serverApi.budget(currentMonth).catch(() => [] as Awaited<ReturnType<typeof serverApi.budget>>),
    serverApi.me().catch(() => null),
  ])
  const isPro = checkIsPro(me?.plan)
  const monthLabel = format(now, 'MMMM yyyy', { locale: dateLocale })
  const firstName  = data.userName.split(' ')[0]
  const mood       = data.mood as MascotMood

  const moodLabel: Partial<Record<MascotMood, string>> = {
    angry: t('alerts.overdueBills'),
    sad:   t('alerts.negativeBalance'),
    happy: t('alerts.positiveBalance'),
    idle:  t('empty.noTransactions'),
  }

  const projData = {
    projections: data.projections.map((p) => ({
      month:             p.month,
      label:             format(new Date(p.month), "MMM. yy", { locale: ptBR }),
      cumulativeBalance: p.projectedBalance,
      income:            p.projectedIncome,
      expense:           p.projectedExpense,
      balance:           p.projectedIncome - p.projectedExpense,
      monthlyResult:     p.projectedIncome - p.projectedExpense,
      incomeItems:  p.incomeItems  ?? { sources: [], recurring: [], people: [] },
      expenseItems: p.expenseItems ?? { bills:   [], recurring: [], people: [] },
    })),
  }

  const savingsRate   = data.monthIncome > 0 ? Math.round(((data.monthIncome - data.monthExpense) / data.monthIncome) * 100) : 0
  const savingsScore  = Math.min(30, Math.max(0, Math.round(savingsRate * 0.3)))
  const billsScore    = data.overdueCount === 0 ? 20 : Math.max(0, 20 - data.overdueCount * 5)
  const goalsScore    = data.goals.length > 0 ? 20 : 0
  const totalScore    = savingsScore + billsScore + goalsScore
  const grade = totalScore >= 60 ? 'A' : totalScore >= 45 ? 'B' : totalScore >= 30 ? 'C' : 'D'
  const health = {
    score:      Math.min(100, totalScore + 30),
    grade:      grade as 'S' | 'A' | 'B' | 'C' | 'D' | 'F',
    label:      totalScore >= 60 ? t('health.veryGood') : totalScore >= 45 ? t('health.good') : totalScore >= 30 ? t('health.regular') : t('health.attention'),
    color:      totalScore >= 45 ? 'text-success' : totalScore >= 30 ? 'text-amber-400' : 'text-danger',
    components: [
      { key: 'savings_rate', label: t('health.savingsRate'), score: savingsScore, max: 30, detail: data.monthIncome > 0 ? `${savingsRate >= 0 ? t('health.saved') : t('health.spent')} ${Math.abs(savingsRate)}% ${t('health.ofIncome')}` : t('empty.noTransactions'), status: savingsRate >= 20 ? 'good' : savingsRate >= 0 ? 'ok' : 'bad' },
      { key: 'bills_on_time', label: t('health.billsOnTime'), score: billsScore, max: 20, detail: data.overdueCount === 0 ? t('health.noBillsOverdue') : t('health.billsOverdue', { count: data.overdueCount }), status: data.overdueCount === 0 ? 'good' : data.overdueCount <= 2 ? 'ok' : 'bad' },
      { key: 'goals', label: t('health.activeGoals'), score: goalsScore, max: 20, detail: data.goals.length > 0 ? t('health.activeGoalsCount', { count: data.goals.length }) : t('health.noGoals'), status: data.goals.length >= 2 ? 'good' : data.goals.length === 1 ? 'ok' : 'neutral' },
    ],
    tips: [],
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* PRO welcome modal — fires when ?upgraded=1 is in URL */}
      <Suspense><WelcomeProModal /></Suspense>
      {/* Upsell modal — shown to free users after 8s, once per day */}
      {!isPro && <UpsellModal />}

      {/* ── Greeting ──────────────────────────────────────────────────── */}
      <DashboardGreeting firstName={firstName} mood={mood} moodLabel={moodLabel[mood] ?? ''} />

      {/* ── KPIs ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <SectionLabel>{t('sections.monthView')} — {monthLabel}</SectionLabel>
        <DashboardKPIs
          totalReceivable={data.totalReceivable}
          totalPeopleReceivable={data.totalPeopleReceivable}
          totalIncomeReceivable={data.totalIncomeReceivable}
          monthIncome={data.monthIncome}
          monthExpense={data.monthExpense}
          monthBalance={data.monthBalance}
          pendingBillsAmount={data.pendingBillsAmount}
          personPayablesAmount={data.personPayablesAmount ?? 0}
          overdueCount={data.overdueCount}
          pendingBillsCount={data.pendingBillsCount}
          incomeChange={data.incomeChange}
          expenseChange={data.expenseChange}
          upcomingBills={data.upcomingBills}
          upcomingPersonPayables={data.upcomingPersonPayables ?? []}
          upcomingPeopleReceivable={data.upcomingPeopleReceivable ?? []}
          pendingIncomeSources={data.pendingIncomeSources ?? []}
          recentTransactions={data.recentTransactions}
          monthIncomeTransactions={data.monthIncomeTransactions}
          monthPeopleReceived={data.monthPeopleReceived ?? []}
          monthLabel={monthLabel}
          monthlyHistory={data.monthlyHistory ?? []}
        />
      </div>

      {/* ── Atenção ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-4 lg:order-3">
        <SectionLabel>{t('sections.attention')}</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <RookinhoInsight insight={data.insight ?? ''} mood={mood} />
          <NextBillHighlight bills={data.upcomingBills} />
        </div>
      </div>

      {/* ── Este mês ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-5 lg:order-4">
        <SectionLabel>{t('sections.thisMonth')}</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MonthPace income={data.monthIncome} expense={data.monthExpense} dayOfMonth={now.getDate()} daysInMonth={daysInMonth} />
          <CategoryDonut categories={data.topCategories ?? []} total={data.monthExpense} />
        </div>
      </div>

      {/* ── Atividade ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-6 lg:order-5">
        <SectionLabel>{t('sections.recentActivity')}</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Transações — 2/3 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('sections.recentTransactions')}</CardTitle>
                  <Link href="/transactions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('sections.recentActivity')} →</Link>
                </div>
              </CardHeader>
              <CardContent>
                {data.recentTransactions.length === 0 ? (
                  <p className="text-sm text-slate-600 py-4 text-center">{t('empty.noTransactions')}</p>
                ) : (
                  <div className="flex flex-col divide-y divide-white/5">
                    {data.recentTransactions.map((tx) => {
                      const brand = getServiceBrand(tx.description, tx.category.name)
                      return (
                        <div key={tx.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <WithTooltip content={brand ? brand.name : tx.category.name} side="right">
                            <div className="size-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
                              style={brand ? { backgroundColor: brand.color, color: brand.text } : { backgroundColor: tx.category.color + '22', color: tx.category.color }}>
                              {brand ? brand.short : tx.category.icon}
                            </div>
                          </WithTooltip>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{tx.description ?? tx.category.name}</p>
                            <p className="text-xs text-slate-500">{tx.category.name} · {formatDate(new Date(tx.date))}</p>
                          </div>
                          <span className={`text-sm font-semibold tabular-nums ${tx.type === 'INCOME' ? 'text-success' : 'text-slate-300'}`}>
                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Metas — 1/3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('sections.activeGoals')}</CardTitle>
                <Link href="/goals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('sections.activeGoals')} →</Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.goals.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">{t('empty.noGoals')}</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.goals.map((goal) => {
                    const pct = Number(goal.targetAmount) > 0 ? Math.min(Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100), 100) : 0
                    return (
                      <div key={goal.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 truncate">{goal.icon ? `${goal.icon} ` : ''}{goal.name}</span>
                          <span className="text-xs font-medium text-slate-400 ml-2 shrink-0">{pct}%</span>
                        </div>
                        <Progress value={Number(goal.currentAmount)} max={Number(goal.targetAmount)} variant="brand" size="sm" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">{formatCurrency(Number(goal.currentAmount), true)}</span>
                          <span className="text-xs text-slate-600">{formatCurrency(Number(goal.targetAmount), true)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Compromissos ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-7 lg:order-6">
        <SectionLabel>{t('sections.upcomingBills')}</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* A Pagar — theme-aware */}
          <ThemedBillCard
            pendingBillsCount={data.pendingBillsCount}
            pendingBillsAmount={data.pendingBillsAmount}
            personPayablesAmount={data.personPayablesAmount ?? 0}
            overdueCount={data.overdueCount}
          />

          {/* Contas próximas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('sections.upcomingBills')}</CardTitle>
                <Link href="/bills" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('sections.upcomingBills')} →</Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.upcomingBills.length === 0 ? (
                <p className="text-sm text-slate-600 py-2 text-center">{t('empty.noBills')}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.upcomingBills.map((bill) => {
                    const status = classifyBillStatus(bill.dueDate, bill.isPaid)
                    return (
                      <div key={bill.id} className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 truncate">{bill.name}</p>
                          <p className="text-xs text-slate-600">{formatDate(new Date(bill.dueDate))}</p>
                        </div>
                        <span className={`text-sm font-semibold shrink-0 tabular-nums ${status === 'overdue' ? 'text-danger' : status === 'urgent' ? 'text-warning' : 'text-slate-300'}`}>
                          {formatCurrency(Number(bill.amount))}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compromissos com pessoas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('sections.withPeople')}</CardTitle>
                <Link href="/people" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('sections.withPeople')} →</Link>
              </div>
            </CardHeader>
            <CardContent>
              {(data.futurePersonPayables ?? []).length === 0 ? (
                <p className="text-sm text-slate-600 py-2 text-center">{t('empty.noCommitments')}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {(data.futurePersonPayables ?? []).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{entry.person.name} · {entry.description}</p>
                        <p className="text-xs text-slate-600">{formatDate(new Date(entry.date))}</p>
                      </div>
                      <span className="text-sm font-semibold shrink-0 tabular-nums text-danger">
                        {formatCurrency(Number(entry.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Planejamento ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-8 lg:order-7">
        <SectionLabel>{t('sections.planning')}</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Orçamento */}
          {budgets.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('sections.monthBudget')}</CardTitle>
                  <Link href="/budget" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">{t('sections.monthBudget')} →</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {budgets.map((b) => {
                    const pct    = Number(b.amount) > 0 ? Math.min(Math.round((b.spent / Number(b.amount)) * 100), 100) : 0
                    const isOver = b.spent > Number(b.amount)
                    const isWarn = !isOver && pct >= 80
                    return (
                      <div key={b.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <span>{b.category.icon}</span>{b.category.name}
                          </span>
                          <span className={`text-xs tabular-nums shrink-0 font-medium ${isOver ? 'text-danger' : isWarn ? 'text-warning' : 'text-slate-500'}`}>{pct}%</span>
                        </div>
                        <Progress value={b.spent} max={Number(b.amount)} variant={isOver ? 'danger' : isWarn ? 'warning' : 'brand'} size="sm" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>Orçamento do mês</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 py-2 text-center">{t('empty.noBudget')}</p>
                <Link href="/budget" className="block text-center text-xs text-brand-400 hover:text-brand-300 mt-2">{t('empty.setupBudget')}</Link>
              </CardContent>
            </Card>
          )}

          {/* Saúde financeira */}
          <FinancialHealthCard health={health as never} />
        </div>
      </div>

      {/* ── Futuro ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 order-3 lg:order-8">
        <SectionLabel>{t('sections.future')}</SectionLabel>
        <ProjectionsSection projections={projData.projections as never} />
      </div>

    </div>
  )
}
