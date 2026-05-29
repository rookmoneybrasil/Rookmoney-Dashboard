'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'

export interface AppNotification {
  id:      string
  type:    'bill' | 'goal' | 'budget' | 'person' | 'income'
  title:   string
  message: string
  href:    string
  urgency: 'high' | 'medium' | 'low'
}

function hashId(...parts: string[]): string {
  return parts.join('-').replace(/[^a-z0-9-]/gi, '_')
}

export async function getNotifications(): Promise<AppNotification[]> {
  const session = await getSession()
  if (!session) redirect('/login')

  const now          = new Date()
  const in3Days      = addDays(now, 3)
  const in7Days      = addDays(now, 7)
  const currentMonth = format(now, 'yyyy-MM')
  const mS           = startOfMonth(now)
  const mE           = endOfMonth(now)

  const [
    overdueBills,
    upcomingBills,
    goals,
    budgets,
    transactions,
    personPayables,
    incomeSources,
  ] = await Promise.all([
    // Contas em ATRASO
    db.bill.findMany({
      where: { userId: session.userId, isPaid: false, dueDate: { lt: now } },
      orderBy: { dueDate: 'asc' },
    }),

    // Contas vencendo nos próximos 3 dias
    db.bill.findMany({
      where: { userId: session.userId, isPaid: false, dueDate: { gte: now, lte: in3Days } },
      orderBy: { dueDate: 'asc' },
    }),

    // Metas com prazo em 7 dias
    db.goal.findMany({
      where: { userId: session.userId, isCompleted: false, deadline: { gte: now, lte: in7Days } },
      orderBy: { deadline: 'asc' },
    }),

    // Orçamentos do mês
    db.budget.findMany({
      where: { userId: session.userId, month: currentMonth },
      include: { category: { select: { name: true } } },
    }),

    // Transações de despesa do mês
    db.transaction.findMany({
      where: { userId: session.userId, type: 'EXPENSE', date: { gte: mS, lte: mE } },
      select: { categoryId: true, amount: true },
    }),

    // Compromissos com pessoas vencendo em 3 dias
    db.personEntry.findMany({
      where: {
        userId: session.userId,
        type: 'I_OWE_THEM',
        isSettled: false,
        date: { gte: now, lte: in3Days },
      },
      include: { person: { select: { name: true } } },
    }),

    // Rendas recorrentes não recebidas este mês cujo dia já passou
    db.incomeSource.findMany({
      where: {
        userId: session.userId,
        isRecurring: true,
        lastAutoPayMonth: { not: currentMonth },
      },
    }),
  ])

  const notifications: AppNotification[] = []

  // ── Contas em atraso ────────────────────────────────────────────
  for (const bill of overdueBills) {
    const daysLate = Math.floor((now.getTime() - new Date(bill.dueDate).getTime()) / 86400000)
    notifications.push({
      id:      hashId('overdue', bill.id),
      type:    'bill',
      title:   bill.name,
      message: `Atrasada há ${daysLate === 0 ? '1' : daysLate} dia${daysLate > 1 ? 's' : ''} · R$ ${Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      href:    '/bills',
      urgency: 'high',
    })
  }

  // ── Contas vencendo em breve ─────────────────────────────────────
  for (const bill of upcomingBills) {
    const diffDays  = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / 86400000)
    const whenLabel = diffDays <= 0 ? 'vence hoje' : diffDays === 1 ? 'vence amanhã' : `vence em ${diffDays} dias`
    notifications.push({
      id:      hashId('bill', bill.id),
      type:    'bill',
      title:   bill.name,
      message: `R$ ${Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${whenLabel}`,
      href:    '/bills',
      urgency: diffDays <= 1 ? 'high' : 'medium',
    })
  }

  // ── Metas próximas do prazo ──────────────────────────────────────
  for (const goal of goals) {
    if (!goal.deadline) continue
    const diffDays = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / 86400000)
    const pct      = Number(goal.targetAmount) > 0 ? Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100) : 0
    notifications.push({
      id:      hashId('goal', goal.id),
      type:    'goal',
      title:   goal.name,
      message: `${pct}% concluída — prazo ${diffDays <= 0 ? 'hoje' : diffDays === 1 ? 'amanhã' : `em ${diffDays} dias`}`,
      href:    '/goals',
      urgency: diffDays <= 3 ? 'high' : 'medium',
    })
  }

  // ── Orçamentos acima de 80% ──────────────────────────────────────
  const spentMap: Record<string, number> = {}
  for (const tx of transactions) {
    spentMap[tx.categoryId] = (spentMap[tx.categoryId] ?? 0) + Number(tx.amount)
  }
  for (const budget of budgets) {
    const limit = Number(budget.amount)
    const spent = spentMap[budget.categoryId] ?? 0
    if (limit <= 0 || spent / limit < 0.8) continue
    const pct   = Math.round((spent / limit) * 100)
    notifications.push({
      id:      hashId('budget', budget.id),
      type:    'budget',
      title:   budget.category.name,
      message: pct >= 100 ? `Limite ultrapassado (${pct}%)` : `${pct}% do limite atingido`,
      href:    '/budget',
      urgency: pct >= 100 ? 'high' : 'medium',
    })
  }

  // ── Compromissos com pessoas vencendo ────────────────────────────
  for (const p of personPayables) {
    const diffDays = Math.ceil((new Date(p.date).getTime() - now.getTime()) / 86400000)
    notifications.push({
      id:      hashId('person', p.id),
      type:    'person',
      title:   `${(p as typeof p & { person: { name: string } }).person.name} · ${p.description}`,
      message: `R$ ${Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — vence ${diffDays <= 0 ? 'hoje' : 'amanhã'}`,
      href:    '/people',
      urgency: 'high',
    })
  }

  // ── Rendas recorrentes não recebidas (dia já passou) ─────────────
  for (const src of incomeSources) {
    const day = src.dayOfMonth ?? 1
    if (day > now.getDate()) continue  // Dia ainda não chegou
    notifications.push({
      id:      hashId('income', src.id),
      type:    'income',
      title:   src.name,
      message: `R$ ${Number(src.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — renda do dia ${day} ainda não confirmada`,
      href:    '/income',
      urgency: 'low',
    })
  }

  return notifications.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.urgency] - order[b.urgency]
  })
}
