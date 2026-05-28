'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'

export interface AppNotification {
  id:      string
  type:    'bill' | 'goal' | 'budget'
  title:   string
  message: string
  href:    string
  urgency: 'high' | 'medium'
}

function hashId(...parts: string[]): string {
  // Simple deterministic id — no crypto.randomUUID() so it stays stable across renders
  return parts.join('-').replace(/[^a-z0-9-]/gi, '_')
}

export async function getNotifications(): Promise<AppNotification[]> {
  const session = await getSession()
  if (!session) redirect('/login')

  const now        = new Date()
  const in3Days    = addDays(now, 3)
  const in7Days    = addDays(now, 7)
  const currentMonth = format(now, 'yyyy-MM')

  const [bills, goals, budgets, transactions, billsForBudget] = await Promise.all([
    // Contas vencendo nos próximos 3 dias, não pagas
    db.bill.findMany({
      where: {
        userId: session.userId,
        isPaid:  false,
        dueDate: { gte: now, lte: in3Days },
      },
      orderBy: { dueDate: 'asc' },
    }),

    // Metas com prazo em 7 dias, não completadas
    db.goal.findMany({
      where: {
        userId:      session.userId,
        isCompleted: false,
        deadline:    { gte: now, lte: in7Days },
      },
      orderBy: { deadline: 'asc' },
    }),

    // Orçamentos do mês atual
    db.budget.findMany({
      where:   { userId: session.userId, month: currentMonth },
      include: { category: true },
    }),

    // Transações de despesa no mês atual (para calcular gasto por categoria)
    db.transaction.findMany({
      where: {
        userId: session.userId,
        type:   'EXPENSE',
        date:   {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    }),

    // Contas do mês atual (para somar ao gasto por categoria)
    db.bill.findMany({
      where: {
        userId:  session.userId,
        dueDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    }),
  ])

  const notifications: AppNotification[] = []

  // ── Contas vencendo em até 3 dias ────────────────────────────────
  for (const bill of bills) {
    const dueDate   = new Date(bill.dueDate)
    const diffMs    = dueDate.getTime() - now.getTime()
    const diffDays  = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const urgency   = diffDays <= 1 ? 'high' : 'medium'
    const whenLabel = diffDays <= 0
      ? 'vence hoje'
      : diffDays === 1
        ? 'vence amanhã'
        : `vence em ${diffDays} dias`

    notifications.push({
      id:      hashId('bill', bill.id),
      type:    'bill',
      title:   bill.name,
      message: `R$ ${Number(bill.amount).toFixed(2).replace('.', ',')} — ${whenLabel}`,
      href:    '/bills',
      urgency,
    })
  }

  // ── Metas próximas do prazo (7 dias) ─────────────────────────────
  for (const goal of goals) {
    if (!goal.deadline) continue
    const deadline  = new Date(goal.deadline)
    const diffMs    = deadline.getTime() - now.getTime()
    const diffDays  = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const current   = Number(goal.currentAmount)
    const target    = Number(goal.targetAmount)
    const pct       = target > 0 ? Math.round((current / target) * 100) : 0
    const urgency   = diffDays <= 3 ? 'high' : 'medium'
    const whenLabel = diffDays <= 0
      ? 'prazo hoje'
      : diffDays === 1
        ? 'prazo amanhã'
        : `prazo em ${diffDays} dias`

    notifications.push({
      id:      hashId('goal', goal.id),
      type:    'goal',
      title:   goal.name,
      message: `${pct}% concluída — ${whenLabel}`,
      href:    '/goals',
      urgency,
    })
  }

  // ── Orçamentos acima de 80% ───────────────────────────────────────
  const spentMap: Record<string, number> = {}
  for (const tx of transactions) {
    spentMap[tx.categoryId] = (spentMap[tx.categoryId] ?? 0) + Number(tx.amount)
  }
  for (const bill of billsForBudget) {
    if (bill.categoryId) {
      spentMap[bill.categoryId] = (spentMap[bill.categoryId] ?? 0) + Number(bill.amount)
    }
  }

  for (const budget of budgets) {
    const limit   = Number(budget.amount)
    const spent   = spentMap[budget.categoryId] ?? 0
    if (limit <= 0) continue
    const pct     = spent / limit
    if (pct < 0.8) continue
    const urgency = pct >= 1 ? 'high' : 'medium'
    const label   = pct >= 1
      ? `Limite ultrapassado (${Math.round(pct * 100)}%)`
      : `${Math.round(pct * 100)}% do limite atingido`

    notifications.push({
      id:      hashId('budget', budget.id),
      type:    'budget',
      title:   budget.category.name,
      message: label,
      href:    '/budget',
      urgency,
    })
  }

  // High urgency first, then medium
  return notifications.sort((a, b) => {
    if (a.urgency === b.urgency) return 0
    return a.urgency === 'high' ? -1 : 1
  })
}
