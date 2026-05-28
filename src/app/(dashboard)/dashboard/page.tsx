import { TrendingUp, TrendingDown, Wallet, ArrowDownToLine } from 'lucide-react'
import { ProjectionsSection } from '@/components/dashboard/projections-section'
import { FinancialHealthCard } from '@/components/dashboard/financial-health-card'
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
  const data = await serverApi.dashboard()

  const now       = new Date()
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
    projections: data.projections.map((p, i) => ({
      month:            p.month,
      cumulativeBalance: p.projectedBalance,
      monthlyResult:    p.projectedIncome - p.projectedExpense,
    })),
  }

  // Adapt health to FinancialHealthCard format
  const health = {
    score:       data.healthScore,
    grade:       data.healthScore >= 80 ? 'A' : data.healthScore >= 60 ? 'B' : data.healthScore >= 40 ? 'C' : 'D',
    label:       data.healthScore >= 80 ? 'Muito bom' : data.healthScore >= 60 ? 'Bom' : data.healthScore >= 40 ? 'Regular' : 'Atenção',
    color:       data.healthScore >= 60 ? 'success' : 'warning',
    insights:    [] as string[],
    categories:  [],
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <WithTooltip content={moodLabel[mood] ?? ''} side="right">
          <div className="shrink-0 size-20 relative cursor-default">
            <Image src={MASCOT_SRCS[mood === 'idle' ? 'happy' : mood]} alt="humor" fill className="object-contain" />
          </div>
        </WithTooltip>
        <div>
          <h1 className="text-xl font-semibold text-slate-100 capitalize">{greeting}, {firstName}.</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthLabel} · Visão geral</p>
        </div>
      </div>

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
        </div>
      </div>

      {/* ── Financial Health ───────────────────────────────────────── */}
      <FinancialHealthCard health={health as never} />

      {/* ── Projeções ──────────────────────────────────────────────── */}
      <ProjectionsSection projections={projData.projections as never} />

    </div>
  )
}
