'use server'

import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthComponent = {
  key:     string
  label:   string
  score:   number   // 0–max
  max:     number
  detail:  string   // e.g. "Poupou 18% da renda"
  status:  'good' | 'ok' | 'warn' | 'bad' | 'neutral'
}

export type HealthTip = {
  icon:    string
  message: string
  href?:   string
}

export type FinancialHealth = {
  score:      number        // 0–100
  grade:      'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  label:      string        // "Excelente", "Bom", etc.
  color:      string        // tailwind color class
  components: HealthComponent[]
  tips:       HealthTip[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function gradeFromScore(score: number): FinancialHealth['grade'] {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  if (score >= 20) return 'D'
  return 'F'
}

function labelFromScore(score: number) {
  if (score >= 90) return 'Excelente'
  if (score >= 75) return 'Muito bom'
  if (score >= 60) return 'Bom'
  if (score >= 40) return 'Regular'
  if (score >= 20) return 'Atenção'
  return 'Crítico'
}

function colorFromScore(score: number) {
  if (score >= 75) return 'text-success'
  if (score >= 50) return 'text-amber-400'
  return 'text-danger'
}

// ─── Main action ──────────────────────────────────────────────────────────────

export async function getFinancialHealth(): Promise<FinancialHealth> {
  const session = await getSession()
  if (!session) redirect('/login')

  const { userId } = session
  const now         = new Date()
  const thisStart   = startOfMonth(now)
  const thisEnd     = endOfMonth(now)
  const prevStart   = startOfMonth(subMonths(now, 1))
  const prevEnd     = endOfMonth(subMonths(now, 1))
  const prev2Start  = startOfMonth(subMonths(now, 2))
  const prev2End    = endOfMonth(subMonths(now, 2))

  const [
    thisTxs, prevTxs, prev2Txs,
    budgets, thisTxsForBudget,
    overdueBills,
    goals,
    openDebts,
  ] = await Promise.all([
    db.transaction.findMany({ where: { userId, date: { gte: thisStart,  lte: thisEnd  } } }),
    db.transaction.findMany({ where: { userId, date: { gte: prevStart,  lte: prevEnd  } } }),
    db.transaction.findMany({ where: { userId, date: { gte: prev2Start, lte: prev2End } } }),
    db.budget.findMany({
      where: { userId, month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` },
    }),
    db.transaction.findMany({ where: { userId, type: 'EXPENSE', date: { gte: thisStart, lte: thisEnd } } }),
    db.bill.findMany({ where: { userId, isPaid: false, dueDate: { lt: now } } }),
    db.goal.findMany({ where: { userId, isCompleted: false }, select: { targetAmount: true, currentAmount: true, deadline: true } }),
    db.personEntry.count({ where: { userId, isSettled: false } }),
  ])

  const tips: HealthTip[] = []
  const components: HealthComponent[] = []

  // ── 1. Taxa de Poupança (30 pts) ────────────────────────────────
  const income  = thisTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const expense = thisTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const savings = income > 0 ? (income - expense) / income : 0

  let savScore = 0
  let savStatus: HealthComponent['status'] = 'neutral'
  let savDetail = 'Sem receitas registradas este mês'

  if (income > 0) {
    const pct = Math.round(savings * 100)
    savDetail = `${pct >= 0 ? '+' : ''}${pct}% da renda este mês`
    if (savings >= 0.20)      { savScore = 30; savStatus = 'good' }
    else if (savings >= 0.10) { savScore = 22; savStatus = 'good' }
    else if (savings >= 0.05) { savScore = 15; savStatus = 'ok'   }
    else if (savings >= 0)    { savScore =  8; savStatus = 'warn' }
    else                      { savScore =  0; savStatus = 'bad'  }

    if (savings < 0.1 && income > 0) {
      tips.push({ icon: '💡', message: `Você poupou ${Math.round(savings * 100)}% este mês. Tente chegar a 10%.`, href: '/transactions' })
    }
  }

  components.push({ key: 'savings', label: 'Taxa de poupança', score: savScore, max: 30, detail: savDetail, status: savStatus })

  // ── 2. Aderência ao Orçamento (25 pts) ──────────────────────────
  let budScore = 12; // neutral if no budgets
  let budStatus: HealthComponent['status'] = 'neutral'
  let budDetail = 'Nenhum orçamento definido'

  if (budgets.length > 0) {
    const spentMap: Record<string, number> = {}
    for (const t of thisTxsForBudget) {
      spentMap[t.categoryId] = (spentMap[t.categoryId] ?? 0) + Number(t.amount)
    }
    const overCount  = budgets.filter(b => (spentMap[b.categoryId] ?? 0) > Number(b.amount)).length
    const ratio      = 1 - overCount / budgets.length
    budScore         = Math.round(clamp(ratio * 25, 0, 25))
    budDetail        = overCount === 0
      ? `${budgets.length} orçamento${budgets.length > 1 ? 's' : ''} dentro do limite`
      : `${overCount} de ${budgets.length} acima do limite`
    budStatus        = overCount === 0 ? 'good' : overCount <= 1 ? 'ok' : 'warn'

    if (overCount > 0) {
      tips.push({ icon: '📊', message: `${overCount} categoria${overCount > 1 ? 's estão' : ' está'} acima do orçamento.`, href: '/budget' })
    }
  } else {
    tips.push({ icon: '📊', message: 'Defina orçamentos por categoria para controlar melhor os gastos.', href: '/budget' })
  }

  components.push({ key: 'budget', label: 'Orçamento', score: budScore, max: 25, detail: budDetail, status: budStatus })

  // ── 3. Contas em Dia (20 pts) ───────────────────────────────────
  const overdueCount = overdueBills.length
  const billScore    = clamp(20 - overdueCount * 5, 0, 20)
  const billStatus: HealthComponent['status'] = overdueCount === 0 ? 'good' : overdueCount <= 2 ? 'warn' : 'bad'
  const billDetail   = overdueCount === 0 ? 'Nenhuma conta vencida' : `${overdueCount} conta${overdueCount > 1 ? 's' : ''} em atraso`

  if (overdueCount > 0) {
    tips.push({ icon: '🔔', message: `${overdueCount} conta${overdueCount > 1 ? 's vencem' : ' vence'} sem pagamento.`, href: '/bills' })
  }

  components.push({ key: 'bills', label: 'Contas em dia', score: billScore, max: 20, detail: billDetail, status: billStatus })

  // ── 4. Metas (15 pts) ───────────────────────────────────────────
  let goalScore = 8; // neutral
  let goalStatus: HealthComponent['status'] = 'neutral'
  let goalDetail = 'Nenhuma meta ativa'

  if (goals.length > 0) {
    const progresses = goals.map(g => {
      const target = Number(g.targetAmount)
      const current = Number(g.currentAmount)
      return target > 0 ? current / target : 0
    })
    const avgProgress = progresses.reduce((s, v) => s + v, 0) / goals.length
    goalScore  = Math.round(clamp(avgProgress * 15, 3, 15))
    goalDetail = `${goals.length} meta${goals.length > 1 ? 's' : ''} · ${Math.round(avgProgress * 100)}% de progresso médio`
    goalStatus = avgProgress >= 0.5 ? 'good' : avgProgress >= 0.2 ? 'ok' : 'warn'

    if (avgProgress < 0.2) {
      tips.push({ icon: '🎯', message: 'Suas metas precisam de atenção. Que tal fazer uma contribuição?', href: '/goals' })
    }
  } else {
    tips.push({ icon: '🎯', message: 'Defina metas financeiras para guiar suas decisões.', href: '/goals' })
  }

  components.push({ key: 'goals', label: 'Metas', score: goalScore, max: 15, detail: goalDetail, status: goalStatus })

  // ── 5. Tendência (10 pts) ───────────────────────────────────────
  const prevIncome  = prevTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const prevExpense = prevTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const prev2Income  = prev2Txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const prev2Expense = prev2Txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

  const thisBalance  = income - expense
  const prevBalance  = prevIncome - prevExpense
  const prev2Balance = prev2Income - prev2Expense

  let trendScore = 5
  let trendStatus: HealthComponent['status'] = 'neutral'
  let trendDetail = 'Dados insuficientes para análise'

  if (prevIncome > 0 || prevExpense > 0) {
    const improving = thisBalance >= prevBalance
    const sustained = prevBalance >= prev2Balance
    trendScore  = improving && sustained ? 10 : improving || sustained ? 7 : prevBalance >= 0 ? 4 : 1
    trendStatus = trendScore >= 8 ? 'good' : trendScore >= 5 ? 'ok' : 'warn'
    trendDetail = improving
      ? 'Saldo melhorando em relação ao mês anterior'
      : 'Saldo caindo em relação ao mês anterior'

    if (!improving) {
      tips.push({ icon: '📉', message: 'Seu saldo piorou em relação ao mês passado. Revise os gastos.', href: '/reports' })
    }
  }

  components.push({ key: 'trend', label: 'Tendência', score: trendScore, max: 10, detail: trendDetail, status: trendStatus })

  // ── 6. Dívidas pessoais (bonus/penalty) ─────────────────────────
  if (openDebts > 5) {
    tips.push({ icon: '🤝', message: `Você tem ${openDebts} lançamentos abertos com pessoas. Que tal acertar alguns?`, href: '/people' })
  }

  // ── Final score ─────────────────────────────────────────────────
  const rawScore = components.reduce((s, c) => s + c.score, 0)
  const score    = clamp(Math.round(rawScore), 0, 100)

  // Keep only top 3 most actionable tips
  const finalTips = tips.slice(0, 3)
  if (finalTips.length === 0) {
    finalTips.push({ icon: '🎉', message: 'Sua saúde financeira está ótima! Continue assim.' })
  }

  return {
    score,
    grade:      gradeFromScore(score),
    label:      labelFromScore(score),
    color:      colorFromScore(score),
    components,
    tips:       finalTips,
  }
}
