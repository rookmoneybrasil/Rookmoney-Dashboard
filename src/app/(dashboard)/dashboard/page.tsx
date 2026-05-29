import { TrendingUp, TrendingDown, Wallet, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { ProjectionsSection } from '@/components/dashboard/projections-section'
import { FinancialHealthCard } from '@/components/dashboard/financial-health-card'
import { DashboardGreeting } from '@/components/dashboard/greeting'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card'
import { BorderGlow } from '@/components/ui/border-glow'
import { Progress } from '@/components/ui/progress'
import { WithTooltip } from '@/components/ui/tooltip'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { getServiceBrand } from '@/lib/service-brands'
import type { MascotMood } from '@/lib/mascot'
import { MASCOT_SRCS } from '@/lib/mascot'
import { serverApi } from '@/lib/api-client'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const now = new Date()
  const currentMonth = format(now, 'yyyy-MM')
  const [data, budgets] = await Promise.all([
    serverApi.dashboard(),
    serverApi.budget(currentMonth).catch(() => [] as Awaited<ReturnType<typeof serverApi.budget>>),
  ])
  const hour      = now.getHours()
  const greeting  = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const monthLabel = format(now, 'MMMM yyyy', { locale: ptBR })
  const firstName  = data.userName.split(' ')[0]
  const mood       = data.mood as MascotMood

  const moodLabel: Partial<Record<MascotMood, string>> = {
    angry: 'Você tem contas atrasadas!',
    sad:   'Saldo negativo este mês.',
    happy: 'Saldo positivo este mês!',
    idle:  'Sem movimentações ainda.',
  }

  // Adapt projections to the format ProjectionsSection expects
  const projData = {
    projections: data.projections.map((p) => ({
      month:             p.month,
      label:             format(new Date(p.month), "MMM. yy", { locale: ptBR }),
      cumulativeBalance: p.projectedBalance,
      income:            p.projectedIncome,
      expense:           p.projectedExpense,
      balance:           p.projectedIncome - p.projectedExpense,
      monthlyResult:     p.projectedIncome - p.projectedExpense,
      incomeItems:       { sources: [], recurring: [], people: [] },
      expenseItems:      { bills:   [], recurring: [], people: [] },
    })),
  }

  // ── Financial health details ──────────────────────────────────────
  const savingsRate   = data.monthIncome > 0 ? Math.round(((data.monthIncome - data.monthExpense) / data.monthIncome) * 100) : 0
  const savingsScore  = Math.min(30, Math.max(0, Math.round(savingsRate * 0.3)))
  const billsScore    = data.overdueCount === 0 ? 20 : Math.max(0, 20 - data.overdueCount * 5)
  const goalsScore    = data.goals.length > 0 ? 20 : 0
  const totalScore    = savingsScore + billsScore + goalsScore

  const grade = totalScore >= 60 ? 'A' : totalScore >= 45 ? 'B' : totalScore >= 30 ? 'C' : 'D'
  const health = {
    score:      Math.min(100, totalScore + 30), // base 30 + components
    grade:      grade as 'S' | 'A' | 'B' | 'C' | 'D' | 'F',
    label:      totalScore >= 60 ? 'Muito bom' : totalScore >= 45 ? 'Bom' : totalScore >= 30 ? 'Regular' : 'Atenção',
    color:      totalScore >= 45 ? 'text-success' : totalScore >= 30 ? 'text-amber-400' : 'text-danger',
    components: [
      {
        key:    'savings_rate',
        label:  'Taxa de poupança',
        score:  savingsScore,
        max:    30,
        detail: data.monthIncome > 0
          ? `${savingsRate >= 0 ? 'Poupou' : 'Gastou'} ${Math.abs(savingsRate)}% da renda`
          : 'Sem renda registrada',
        status: savingsRate >= 20 ? 'good' : savingsRate >= 0 ? 'ok' : 'bad',
      },
      {
        key:    'bills_on_time',
        label:  'Contas em dia',
        score:  billsScore,
        max:    20,
        detail: data.overdueCount === 0 ? 'Nenhuma conta em atraso' : `${data.overdueCount} conta(s) em atraso`,
        status: data.overdueCount === 0 ? 'good' : 'bad',
      },
      {
        key:    'goals',
        label:  'Metas ativas',
        score:  goalsScore,
        max:    20,
        detail: data.goals.length > 0 ? `${data.goals.length} meta(s) em andamento` : 'Nenhuma meta definida',
        status: data.goals.length > 0 ? 'good' : 'warn',
      },
    ],
    tips: [
      ...(data.goals.length === 0
        ? [{ icon: '🎯', message: 'Defina metas financeiras para guiar suas decisões.', href: '/goals' }]
        : []),
      ...(savingsRate < 10
        ? [{ icon: '📊', message: 'Defina orçamentos por categoria para controlar melhor os gastos.', href: '/budget' }]
        : []),
      ...(data.overdueCount > 0
        ? [{ icon: '⚠️', message: `Você tem ${data.overdueCount} conta(s) em atraso. Regularize o quanto antes.`, href: '/bills' }]
        : []),
    ],
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ── Page title — client component to avoid hydration mismatch ── */}
      <DashboardGreeting
        firstName={firstName}
        mood={mood}
        moodLabel={moodLabel[mood] ?? ''}
      />

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WithTooltip content="Total de receitas menos despesas no mês atual" side="bottom">
          <div>
            <BorderGlow backgroundColor="#111E32" glowColor="221 83 53" colors={['#2563EB', '#6366f1', '#3B82F6']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <StatCard label="Saldo do mês" value={formatCurrency(data.monthBalance)} variant="default" icon={<Wallet className="size-4" />} sub={`Receitas − despesas de ${format(now, 'MMM', { locale: ptBR })}`} className="bg-transparent border-transparent" />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Soma de todas as entradas registradas no mês" side="bottom">
          <div>
            <BorderGlow backgroundColor="#052E16" glowColor="142 71 45" colors={['#22c55e', '#4ade80', '#16a34a']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <StatCard label="Receitas" value={formatCurrency(data.monthIncome)} variant="income" icon={<TrendingUp className="size-4" />} trend={data.incomeChange !== 0 ? { value: data.incomeChange, label: 'vs mês ant.' } : undefined} sub="Total recebido" className="bg-transparent border-transparent" />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Soma de todas as saídas registradas no mês" side="bottom">
          <div>
            <BorderGlow backgroundColor="#450A0A" glowColor="0 84 60" colors={['#ef4444', '#f87171', '#dc2626']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <StatCard label="Despesas" value={formatCurrency(data.monthExpense)} variant="expense" icon={<TrendingDown className="size-4" />} trend={data.expenseChange !== 0 ? { value: data.expenseChange, label: 'vs mês ant.' } : undefined} sub="Total gasto" className="bg-transparent border-transparent" />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Pessoas que te devem + rendas eventuais pendentes" side="bottom">
          <div>
            <BorderGlow backgroundColor="#1C0D00" glowColor="38 92 50" colors={['#f59e0b', '#fbbf24', '#d97706']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <StatCard label="A Receber" value={formatCurrency(data.totalReceivable)} variant="gold" icon={<ArrowDownToLine className="size-4" />} sub={data.totalReceivable === 0 ? 'Nada pendente' : [data.totalPeopleReceivable > 0 && `${formatCurrency(data.totalPeopleReceivable, true)} de pessoas`, data.totalIncomeReceivable > 0 && `${formatCurrency(data.totalIncomeReceivable, true)} de rendas`].filter(Boolean).join(' · ')} className="bg-transparent border-transparent" />
            </BorderGlow>
          </div>
        </WithTooltip>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transações recentes</CardTitle>
                <a href="/transactions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">Nenhuma transação ainda.</p>
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

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metas ativas</CardTitle>
                <a href="/goals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
              </div>
            </CardHeader>
            <CardContent>
              {data.goals.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">Nenhuma meta criada.</p>
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

          {/* Orçamento do mês */}
          {budgets.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Orçamento do mês</CardTitle>
                  <a href="/budget" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver tudo →</a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {budgets.map((b) => {
                    const pct     = Number(b.amount) > 0 ? Math.min(Math.round((b.spent / Number(b.amount)) * 100), 100) : 0
                    const isOver  = b.spent > Number(b.amount)
                    const isWarn  = !isOver && pct >= 80
                    return (
                      <div key={b.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
                            <span>{b.category.icon}</span>{b.category.name}
                          </span>
                          <span className={`text-xs tabular-nums shrink-0 font-medium ${isOver ? 'text-danger' : isWarn ? 'text-warning' : 'text-slate-500'}`}>
                            {pct}%
                          </span>
                        </div>
                        <Progress
                          value={b.spent}
                          max={Number(b.amount)}
                          variant={isOver ? 'danger' : isWarn ? 'warning' : 'brand'}
                          size="sm"
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Financial Health ───────────────────────────────────────── */}
      <FinancialHealthCard health={health as never} />

      {/* ── Bottom grid: A Pagar · Contas próximas · Compromissos · Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* A Pagar */}
        <BorderGlow backgroundColor="#1A0505" glowColor="0 84 60" colors={['#ef4444', '#f87171', '#dc2626']} borderRadius={12} glowRadius={24} glowIntensity={1.2} coneSpread={30} fillOpacity={0.6}>
          <Card className="bg-transparent border-transparent h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpFromLine className="size-4 text-danger" />
                A Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.pendingBillsAmount === 0 && (data.personPayablesAmount ?? 0) === 0 ? (
                <p className="text-sm text-slate-600 py-2 text-center">Nenhum compromisso pendente.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.pendingBillsCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">{data.pendingBillsCount} conta{data.pendingBillsCount !== 1 ? 's' : ''}</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-300">{formatCurrency(data.pendingBillsAmount)}</span>
                    </div>
                  )}
                  {(data.personPayablesAmount ?? 0) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Dívidas com pessoas</span>
                      <span className="text-sm font-semibold tabular-nums text-slate-300">{formatCurrency(data.personPayablesAmount)}</span>
                    </div>
                  )}
                  {data.overdueCount > 0 && (
                    <div className="flex flex-col gap-1 p-2 rounded-lg bg-danger/8 border border-danger/15">
                      <span className="text-xs font-semibold text-danger">⚠ {data.overdueCount} conta{data.overdueCount > 1 ? 's' : ''} em atraso</span>
                      <span className="text-[11px] text-danger/70 leading-snug">
                        {data.overdueCount > 1
                          ? 'Essas contas não foram pagas e continuam acumulando. Regularize o quanto antes.'
                          : 'Essa conta não foi paga ainda. Regularize o quanto antes.'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-white/6 pt-2 mt-1">
                    <span className="text-sm font-semibold text-slate-300">Total</span>
                    <span className="text-base font-bold text-danger">{formatCurrency((data.pendingBillsAmount ?? 0) + (data.personPayablesAmount ?? 0))}</span>
                  </div>
                  <a href="/bills" className="text-xs text-brand-400 hover:text-brand-300 transition-colors text-center mt-1">
                    Ver contas →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </BorderGlow>

        {/* Contas próximas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas próximas</CardTitle>
              <a href="/bills" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcomingBills.length === 0 ? (
              <p className="text-sm text-slate-600 py-2 text-center">Nenhuma conta próxima.</p>
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
              <CardTitle>Compromissos</CardTitle>
              <a href="/people" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</a>
            </div>
          </CardHeader>
          <CardContent>
            {(data.upcomingPersonPayables ?? []).length === 0 ? (
              <p className="text-sm text-slate-600 py-2 text-center">Nenhum compromisso próximo.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {(data.upcomingPersonPayables ?? []).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate">{entry.person.name} / {entry.description}</p>
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

        {/* Rook Insight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-brand-700 border border-brand-600/40 overflow-hidden shrink-0">
                <img src={MASCOT_SRCS['happy']} alt="Rook" className="object-contain w-full h-full" />
              </div>
              Rook
              <Badge variant="default" size="sm">Insight</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm text-slate-300 leading-relaxed">
              {data.overdueCount > 0 && (
                <p>⚠️ Você tem {data.overdueCount} conta{data.overdueCount > 1 ? 's' : ''} em atraso. Regularize o quanto antes!</p>
              )}
              {(data.overBudgetCount ?? 0) > 0 && (
                <p>📊 {data.overBudgetCount} categoria{data.overBudgetCount > 1 ? 's' : ''} atingiu 80%+ do orçamento. Fique de olho!</p>
              )}
              {data.overdueCount === 0 && (data.overBudgetCount ?? 0) === 0 && (
                <p>
                  {data.monthBalance > 0
                    ? `✅ Você ficou no positivo este mês. Saldo: ${formatCurrency(data.monthBalance)}.`
                    : data.monthBalance < 0
                    ? `📉 Saldo negativo este mês (${formatCurrency(data.monthBalance)}). Revise seus gastos.`
                    : `💡 Sem movimentações ainda. Registre suas receitas e despesas para acompanhar.`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Projeções ──────────────────────────────────────────────── */}
      <ProjectionsSection projections={projData.projections as never} />

    </div>
  )
}
