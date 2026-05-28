import { TrendingUp, TrendingDown, Wallet, Target, Calendar, Castle, ArrowDownToLine, Users, Zap } from 'lucide-react'
import { getProjections } from '@/app/actions/projections'
import { ProjectionsSection } from '@/components/dashboard/projections-section'
import { getFinancialHealth } from '@/app/actions/financial-health'
import { FinancialHealthCard } from '@/components/dashboard/financial-health-card'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui/card'
import { BorderGlow } from '@/components/ui/border-glow'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { WithTooltip } from '@/components/ui/tooltip'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { getDashboardData } from '@/app/actions/dashboard'
import { processAutoIncome } from '@/app/actions/income-sources'
import { processAutoRecurring } from '@/app/actions/recurring-transactions'
import { getServiceBrand } from '@/lib/service-brands'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import type { MascotMood } from '@/lib/mascot'
import { MASCOT_SRCS } from '@/lib/mascot'

async function getGreetingMood(): Promise<MascotMood> {
  const session = await getSession()
  if (!session) return 'idle'

  const now       = new Date()
  const overdueCount = await db.bill.count({
    where: { userId: session.userId, isPaid: false, dueDate: { lt: now } },
  })
  if (overdueCount > 0) return 'angry'

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const txs = await db.transaction.findMany({
    where:  { userId: session.userId, date: { gte: monthStart } },
    select: { type: true, amount: true },
  })
  const income  = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  if (income === 0 && expense === 0) return 'idle'
  return income - expense >= 0 ? 'happy' : 'sad'
}

export default async function DashboardPage() {
  const session = await getSession()
  if (session) {
    await processAutoIncome(session.userId)
    await processAutoRecurring(session.userId)
  }

  const [data, mood, projections, health] = await Promise.all([
    getDashboardData(),
    getGreetingMood(),
    getProjections(5),
    getFinancialHealth(),
  ])

  const now        = new Date()
  const hour       = now.getHours()
  const greeting   = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const monthLabel = format(now, 'MMMM yyyy', { locale: ptBR })
  const firstName  = data.userName.split(' ')[0]

  const moodLabel: Partial<Record<MascotMood, string>> = {
    angry: 'Você tem contas atrasadas!',
    sad:   'Saldo negativo este mês.',
    happy: 'Saldo positivo este mês!',
    idle:  'Sem movimentações ainda.',
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <WithTooltip content={moodLabel[mood] ?? ''} side="right">
          <div className="shrink-0 size-20 relative cursor-default">
            <Image
              src={MASCOT_SRCS[mood === 'idle' ? 'happy' : mood]}
              alt="humor"
              fill
              className="object-contain"
            />
          </div>
        </WithTooltip>
        <div>
          <h1 className="text-xl font-semibold text-slate-100 capitalize">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthLabel} · Visão geral</p>
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <WithTooltip content="Total de receitas menos despesas no mês atual" side="bottom">
          <div>
            <BorderGlow
              backgroundColor="#111E32"
              glowColor="221 83 53"
              colors={['#2563EB', '#6366f1', '#3B82F6']}
              borderRadius={12}
              glowRadius={20}
              glowIntensity={1.0}
              coneSpread={25}
              fillOpacity={0.5}
            >
              <StatCard
                label="Saldo do mês"
                value={formatCurrency(data.monthBalance)}
                variant="default"
                icon={<Wallet className="size-4" />}
                sub={`Receitas − despesas de ${format(now, 'MMM', { locale: ptBR })}`}
                className="bg-transparent border-transparent"
              />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Soma de todas as entradas registradas no mês" side="bottom">
          <div>
            <BorderGlow
              backgroundColor="#052E16"
              glowColor="142 71 45"
              colors={['#22c55e', '#4ade80', '#16a34a']}
              borderRadius={12}
              glowRadius={20}
              glowIntensity={1.0}
              coneSpread={25}
              fillOpacity={0.5}
            >
              <StatCard
                label="Receitas"
                value={formatCurrency(data.monthIncome)}
                variant="income"
                icon={<TrendingUp className="size-4" />}
                trend={data.incomeChange !== 0 ? { value: data.incomeChange, label: 'vs mês ant.' } : undefined}
                sub="Total recebido"
                className="bg-transparent border-transparent"
              />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Soma de todas as saídas registradas no mês" side="bottom">
          <div>
            <BorderGlow
              backgroundColor="#450A0A"
              glowColor="0 84 60"
              colors={['#ef4444', '#f87171', '#dc2626']}
              borderRadius={12}
              glowRadius={20}
              glowIntensity={1.0}
              coneSpread={25}
              fillOpacity={0.5}
            >
              <StatCard
                label="Despesas"
                value={formatCurrency(data.monthExpense)}
                variant="expense"
                icon={<TrendingDown className="size-4" />}
                trend={data.expenseChange !== 0 ? { value: data.expenseChange, label: 'vs mês ant.' } : undefined}
                sub="Total gasto"
                className="bg-transparent border-transparent"
              />
            </BorderGlow>
          </div>
        </WithTooltip>
        <WithTooltip content="Pessoas que te devem + rendas eventuais pendentes" side="bottom">
          <div>
            <BorderGlow
              backgroundColor="#1C0D00"
              glowColor="38 92 50"
              colors={['#f59e0b', '#fbbf24', '#d97706']}
              borderRadius={12}
              glowRadius={20}
              glowIntensity={1.0}
              coneSpread={25}
              fillOpacity={0.5}
            >
              <StatCard
                label="A Receber"
                value={formatCurrency(data.totalReceivable)}
                variant="gold"
                icon={<ArrowDownToLine className="size-4" />}
                sub={
                  data.totalReceivable === 0
                    ? 'Nada pendente'
                    : [
                        data.totalPeopleReceivable > 0 && `${formatCurrency(data.totalPeopleReceivable, true)} de pessoas`,
                        data.totalIncomeReceivable > 0 && `${formatCurrency(data.totalIncomeReceivable, true)} de rendas`,
                      ].filter(Boolean).join(' · ')
                }
                className="bg-transparent border-transparent"
              />
            </BorderGlow>
          </div>
        </WithTooltip>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Transações recentes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transações recentes</CardTitle>
                <a href="/transactions" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Ver todas →
                </a>
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
                        <div
                          className="size-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
                          style={
                            brand
                              ? { backgroundColor: brand.color, color: brand.text }
                              : { backgroundColor: tx.category.color + '22', color: tx.category.color }
                          }
                        >
                          {brand ? brand.short : tx.category.icon}
                        </div>
                      </WithTooltip>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {tx.description ?? tx.category.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.category.name} · {formatDate(tx.date)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          tx.type === 'INCOME' ? 'text-success' : 'text-slate-300'
                        }`}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </div>
                  )})}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metas ativas */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Metas ativas</CardTitle>
                <a href="/goals" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Ver todas →
                </a>
              </div>
            </CardHeader>
            <CardContent>
              {data.goals.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">Nenhuma meta criada.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.goals.map((goal) => {
                    const pct = goal.targetAmount > 0
                      ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
                      : 0
                    return (
                      <div key={goal.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 truncate">
                            {goal.icon ? `${goal.icon} ` : ''}{goal.name}
                          </span>
                          <span className="text-xs font-medium text-slate-400 ml-2 shrink-0">
                            {pct}%
                          </span>
                        </div>
                        <Progress value={goal.currentAmount} max={goal.targetAmount} variant="brand" size="sm" />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">
                            {formatCurrency(goal.currentAmount, true)}
                          </span>
                          <span className="text-xs text-slate-600">
                            {formatCurrency(goal.targetAmount, true)}
                          </span>
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

      {/* ── Financial Health ───────────────────────────────────────── */}
      <FinancialHealthCard health={health} />

      {/* ── Projections ────────────────────────────────────────────── */}
      <ProjectionsSection projections={projections} />

      {/* ── Bottom row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* A Receber */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownToLine className="size-4 text-gold-400" />
                A Receber
              </CardTitle>
              {data.totalReceivable > 0 && (
                <span className="text-xs font-semibold text-gold-400 tabular-nums">
                  {formatCurrency(data.totalReceivable)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.totalReceivable === 0 ? (
              <p className="text-sm text-slate-600 py-4 text-center">Nada a receber no momento.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {/* People receivables */}
                {data.totalPeopleReceivable > 0 && (
                  <div className="flex flex-col gap-2">
                    <a href="/people" className="flex items-center justify-between group">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        Pessoas
                      </span>
                      <span className="text-xs text-brand-400 group-hover:text-brand-300 transition-colors">
                        Ver todas →
                      </span>
                    </a>
                    <div className="flex flex-col gap-1.5">
                      {data.peopleReceivables.map((p) => {
                        const initials = p.name.split(' ').slice(0,2).map((n: string) => n[0]?.toUpperCase()).join('')
                        return (
                          <a key={p.id} href={`/people/${p.id}`} className="flex items-center gap-2.5 py-1.5 hover:bg-ink-700/40 rounded-lg px-1.5 -mx-1.5 transition-colors group/row">
                            <div
                              className="size-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                              style={{ backgroundColor: p.color ?? '#6366f1' }}
                            >
                              {initials}
                            </div>
                            <span className="text-sm text-slate-300 flex-1 truncate">{p.name}</span>
                            <span className="text-sm font-semibold text-success tabular-nums shrink-0">
                              +{formatCurrency(p.total)}
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Pending income sources */}
                {data.totalIncomeReceivable > 0 && (
                  <div className="flex flex-col gap-2">
                    <a href="/income" className="flex items-center justify-between group">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="size-3.5" />
                        Rendas eventuais
                      </span>
                      <span className="text-xs text-brand-400 group-hover:text-brand-300 transition-colors">
                        Ver todas →
                      </span>
                    </a>
                    <div className="flex flex-col gap-1.5">
                      {data.pendingIncomeList.map((inc) => (
                        <div key={inc.id} className="flex items-center gap-2.5 py-1.5 px-1.5 -mx-1.5">
                          <div className="size-7 rounded-lg bg-ink-700 flex items-center justify-center text-sm shrink-0">
                            {inc.type === 'FREELANCE' ? '🧑‍💻' : inc.type === 'RENTAL' ? '🏠' : '💡'}
                          </div>
                          <span className="text-sm text-slate-300 flex-1 truncate">{inc.name}</span>
                          <span className="text-sm font-semibold text-success tabular-nums shrink-0">
                            +{formatCurrency(inc.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contas próximas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas próximas</CardTitle>
              <a href="/bills" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Ver todas →
              </a>
            </div>
          </CardHeader>
          <CardContent>
            {data.upcomingBills.length === 0 ? (
              <p className="text-sm text-slate-600 py-4 text-center">Nenhuma conta próxima.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.upcomingBills.map((bill) => {
                  const status = classifyBillStatus(bill.dueDate, bill.isPaid)
                  return (
                    <div key={bill.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-ink-600 flex items-center justify-center shrink-0">
                          <Calendar className="size-3.5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-slate-300 truncate">{bill.name}</p>
                          <p className="text-xs text-slate-600">
                            {formatDate(bill.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-semibold text-slate-200 tabular-nums">
                          {formatCurrency(bill.amount)}
                        </span>
                        <Badge variant={status === 'urgent' || status === 'overdue' ? 'danger' : 'default'} size="sm" dot>
                          {status === 'overdue' ? 'Atrasado' : status === 'urgent' ? 'Urgente' : 'Pendente'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights do Rook */}
        <div className="lg:col-span-2">
          <Card variant="elevated" className="h-full">
            <CardContent className="flex flex-col gap-4 h-full justify-between">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-brand">
                  <Castle className="size-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">Rook</span>
                    <Badge variant="brand" size="sm">Insight</Badge>
                  </div>
                  {data.insights.length > 0 ? (
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {data.insights[0]}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Adicione transações para receber insights personalizados.
                    </p>
                  )}
                </div>
              </div>

              {data.insights.length > 1 && (
                <div className="flex flex-col gap-2">
                  {data.insights.slice(1).map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-ink-800/60">
                      <Target className="size-4 text-gold-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-500">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
