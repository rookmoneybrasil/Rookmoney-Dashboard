'use server'

import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function getDashboardData() {
  const session = await getSession()
  if (!session) redirect('/login')

  const now        = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd   = endOfMonth(now)

  const prevStart = startOfMonth(subMonths(now, 1))
  const prevEnd   = endOfMonth(subMonths(now, 1))

  const [
    currentMonthTxs,
    prevMonthTxs,
    recentTxs,
    goals,
    upcomingBills,
    currentMonthBills,
    prevMonthBills,
    peopleEntries,
    pendingIncomeSources,
  ] = await Promise.all([
    db.transaction.findMany({
      where:   { userId: session.userId, date: { gte: monthStart, lte: monthEnd } },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: { userId: session.userId, date: { gte: prevStart, lte: prevEnd } },
    }),
    db.transaction.findMany({
      where:   { userId: session.userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take:    7,
    }),
    db.goal.findMany({
      where:   { userId: session.userId, isCompleted: false },
      orderBy: { createdAt: 'desc' },
      take:    3,
    }),
    db.bill.findMany({
      where: {
        userId:  session.userId,
        isPaid:  false,
        dueDate: { lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { dueDate: 'asc' },
      take: 4,
    }),
    db.bill.findMany({
      where: { userId: session.userId, dueDate: { gte: monthStart, lte: monthEnd } },
    }),
    db.bill.findMany({
      where: { userId: session.userId, dueDate: { gte: prevStart, lte: prevEnd } },
    }),
    // People: unsettled entries where THEY owe us
    db.personEntry.findMany({
      where:   { userId: session.userId, isSettled: false, type: 'THEY_OWE_ME' },
      include: { person: { select: { id: true, name: true, color: true } } },
    }),
    // Non-recurring income sources = "expected" income not yet received
    db.incomeSource.findMany({
      where:   { userId: session.userId, isRecurring: false },
      orderBy: { amount: 'desc' },
      take:    5,
    }),
  ])

  // Current month aggregates (transactions + bills due this month)
  const monthIncome   = currentMonthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const txExpense     = currentMonthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const billExpense   = currentMonthBills.reduce((s, b) => s + Number(b.amount), 0)
  const monthExpense  = txExpense + billExpense
  const monthBalance  = monthIncome - monthExpense

  // Previous month aggregates
  const prevIncome  = prevMonthTxs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const prevTxExp   = prevMonthTxs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const prevBillExp = prevMonthBills.reduce((s, b) => s + Number(b.amount), 0)
  const prevExpense = prevTxExp + prevBillExp

  const incomeChange  = prevIncome  > 0 ? Math.round(((monthIncome  - prevIncome)  / prevIncome)  * 100) : 0
  const expenseChange = prevExpense > 0 ? Math.round(((monthExpense - prevExpense) / prevExpense) * 100) : 0

  // Category breakdown
  const expTxs = currentMonthTxs.filter(t => t.type === 'EXPENSE')
  const byCat  = expTxs.reduce<Record<string, { category: typeof expTxs[number]['category']; total: number; count: number }>>(
    (acc, t) => {
      const key = t.categoryId
      if (!acc[key]) acc[key] = { category: t.category, total: 0, count: 0 }
      acc[key].total += Number(t.amount)
      acc[key].count++
      return acc
    },
    {}
  )

  const categoryBreakdown = Object.values(byCat)
    .map(({ category, total, count }) => ({
      categoryId:    category.id,
      categoryName:  category.name,
      categoryColor: category.color,
      categoryIcon:  category.icon,
      total,
      percentage:    monthExpense > 0 ? Math.round((total / monthExpense) * 100) : 0,
      transactionCount: count,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  // 6-month history
  const monthlySummary = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const d     = subMonths(now, 4 - i)
      const start = startOfMonth(d)
      const end   = endOfMonth(d)
      return db.transaction.findMany({
        where: { userId: session.userId, date: { gte: start, lte: end } },
        select: { type: true, amount: true },
      }).then(txs => ({
        month:        format(d, 'MMM', { locale: undefined }),
        totalIncome:  txs.filter(t => t.type === 'INCOME').reduce((s, t)  => s + Number(t.amount), 0),
        totalExpense: txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
        balance:      0,
      }))
    })
  )

  monthlySummary.forEach(m => { m.balance = m.totalIncome - m.totalExpense })

  // ── Receivables ──────────────────────────────────────────────────────────
  // Group people entries by person and sum
  const byPerson = new Map<string, { id: string; name: string; color: string | null; total: number }>()
  for (const e of peopleEntries) {
    const p = e.person
    const cur = byPerson.get(p.id) ?? { id: p.id, name: p.name, color: p.color, total: 0 }
    cur.total += Number(e.amount)
    byPerson.set(p.id, cur)
  }
  const peopleReceivables = Array.from(byPerson.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 4)

  const totalPeopleReceivable  = Array.from(byPerson.values()).reduce((s, p) => s + p.total, 0)
  const totalIncomeReceivable  = pendingIncomeSources.reduce((s, i) => s + Number(i.amount), 0)
  const totalReceivable        = totalPeopleReceivable + totalIncomeReceivable

  const pendingIncomeList = pendingIncomeSources.map((i) => ({
    id:     i.id,
    name:   i.name,
    amount: Number(i.amount),
    type:   i.type as string,
  }))

  // Simple insights
  const insights: string[] = []
  if (categoryBreakdown[0]) {
    insights.push(
      `${categoryBreakdown[0].categoryName} foi seu maior gasto este mês: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(categoryBreakdown[0].total)} (${categoryBreakdown[0].percentage}% das despesas).`
    )
  }
  if (monthBalance >= 0) {
    insights.push(`Você ficou no positivo este mês. Saldo: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthBalance)}.`)
  }
  if (goals[0]) {
    const pct = Math.round((Number(goals[0].currentAmount) / Number(goals[0].targetAmount)) * 100)
    insights.push(`Sua meta "${goals[0].name}" está ${pct}% concluída.`)
  }

  return {
    userName:       session.name,
    monthIncome,
    monthExpense,
    monthBalance,
    incomeChange,
    expenseChange,
    recentTransactions: recentTxs,
    categoryBreakdown,
    monthlySummary,
    goals:          goals.map(g => ({ ...g, targetAmount: Number(g.targetAmount), currentAmount: Number(g.currentAmount) })),
    upcomingBills:  upcomingBills.map(b => ({ ...b, amount: Number(b.amount) })),
    insights,
    // Receivables
    totalReceivable,
    totalPeopleReceivable,
    totalIncomeReceivable,
    peopleReceivables,
    pendingIncomeList,
  }
}

export async function getReportsData(monthsBack = 5, endMonth?: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const now = endMonth ? new Date(endMonth + '-15') : new Date()

  const monthly = await Promise.all(
    Array.from({ length: monthsBack + 1 }, (_, i) => {
      const d     = subMonths(now, monthsBack - i)
      const start = startOfMonth(d)
      const end   = endOfMonth(d)
      return Promise.all([
        db.transaction.findMany({
          where: { userId: session.userId, date: { gte: start, lte: end } },
          include: { category: true },
        }),
        db.bill.findMany({
          where: { userId: session.userId, dueDate: { gte: start, lte: end } },
          select: { amount: true },
        }),
      ]).then(([txs, bills]) => {
        const income      = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
        const txExpense   = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
        const billExpense = bills.reduce((s, b) => s + Number(b.amount), 0)
        const expense     = txExpense + billExpense

        const byCat = txs.filter(t => t.type === 'EXPENSE').reduce<Record<string, { name: string; color: string; icon: string; total: number }>>(
          (acc, t) => {
            if (!acc[t.categoryId]) acc[t.categoryId] = { name: t.category.name, color: t.category.color, icon: t.category.icon, total: 0 }
            acc[t.categoryId].total += Number(t.amount)
            return acc
          }, {}
        )

        return {
          month:           format(d, 'MMM/yy'),
          monthFull:       format(d, 'MMMM yyyy'),
          totalIncome:     income,
          totalExpense:    expense,
          balance:         income - expense,
          categoryBreakdown: Object.values(byCat)
            .map(c => ({ ...c, pct: expense > 0 ? Math.round((c.total / expense) * 100) : 0 }))
            .sort((a, b) => b.total - a.total),
        }
      })
    })
  )

  return monthly
}
