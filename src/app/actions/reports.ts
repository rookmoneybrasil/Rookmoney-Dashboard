'use server'

import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, subMonths, format, getDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonthlyPoint = {
  month:             string   // 'jan/26'
  monthFull:         string   // 'janeiro 2026'
  monthKey:          string   // '2026-01'
  totalIncome:       number
  totalExpense:      number
  balance:           number
  savingsRate:       number   // % of income saved (can be negative)
  categoryBreakdown: CategoryPoint[]
}

export type CategoryPoint = {
  categoryId: string
  name:  string
  icon:  string
  color: string
  total: number
  pct:   number
}

export type TopExpense = {
  id:          string
  description: string
  amount:      number
  date:        string
  category:    { name: string; icon: string; color: string }
}

export type DaySpending = {
  day:   number
  total: number
  count: number
}

export type CategoryTrend = {
  categoryId: string
  name:  string
  icon:  string
  color: string
  total: number           // entire period
  pct:   number           // % of total period expense
  monthTotals: number[]   // one entry per month in order
  delta: number | null    // last month vs prev month delta (null if < 2 months)
}

export type IncomeSource = {
  name:  string
  icon:  string
  color: string
  total: number
  pct:   number
}

export type PeriodStats = {
  totalIncome:       number
  totalExpense:      number
  netBalance:        number
  savingsRate:       number   // % (can be negative)
  avgMonthlyIncome:  number
  avgMonthlyExpense: number
  positiveMonths:    number
  totalMonths:       number
  bestMonth:         string | null
  worstMonth:        string | null
}

export type ReportsData = {
  monthly:        MonthlyPoint[]
  period:         PeriodStats
  topExpenses:    TopExpense[]
  spendingByDay:  DaySpending[]
  categoryTrend:  CategoryTrend[]
  incomeSources:  IncomeSource[]
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function getReportsData(monthsBack = 5, endMonth?: string): Promise<ReportsData> {
  const session = await getSession()
  if (!session) redirect('/login')

  const { userId } = session

  const refDate  = endMonth ? new Date(endMonth + '-15') : new Date()
  const start    = startOfMonth(subMonths(refDate, monthsBack))
  const end      = endOfMonth(refDate)
  const nMonths  = monthsBack + 1

  // Single query for all transactions in period
  const allTxs = await db.transaction.findMany({
    where:   { userId, date: { gte: start, lte: end } },
    include: { category: true },
    orderBy: { amount: 'desc' },
  })

  // ── Monthly breakdown ────────────────────────────────────────────────────

  const monthly: MonthlyPoint[] = Array.from({ length: nMonths }, (_, i) => {
    const d      = subMonths(refDate, monthsBack - i)
    const mStart = startOfMonth(d)
    const mEnd   = endOfMonth(d)

    const txs       = allTxs.filter(t => t.date >= mStart && t.date <= mEnd)
    const income    = txs.filter(t => t.type === 'INCOME').reduce((s, t)  => s + Number(t.amount), 0)
    const expense   = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
    const balance   = income - expense
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0

    // Category breakdown (expenses only)
    const byCat: Record<string, { name: string; icon: string; color: string; total: number }> = {}
    for (const t of txs.filter(t => t.type === 'EXPENSE')) {
      if (!byCat[t.categoryId]) byCat[t.categoryId] = { name: t.category.name, icon: t.category.icon, color: t.category.color, total: 0 }
      byCat[t.categoryId].total += Number(t.amount)
    }

    const categoryBreakdown: CategoryPoint[] = Object.entries(byCat)
      .map(([categoryId, c]) => ({ categoryId, ...c, pct: expense > 0 ? Math.round((c.total / expense) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)

    return {
      month:     format(d, "MMM/yy", { locale: ptBR }),
      monthFull: format(d, "MMMM yyyy", { locale: ptBR }),
      monthKey:  format(d, 'yyyy-MM'),
      totalIncome:  income,
      totalExpense: expense,
      balance,
      savingsRate,
      categoryBreakdown,
    }
  })

  // ── Period totals ────────────────────────────────────────────────────────

  const periodIncome  = monthly.reduce((s, m) => s + m.totalIncome, 0)
  const periodExpense = monthly.reduce((s, m) => s + m.totalExpense, 0)
  const netBalance    = periodIncome - periodExpense
  const savingsRate   = periodIncome > 0 ? Math.round((netBalance / periodIncome) * 100) : 0

  const sortedByBalance = [...monthly].sort((a, b) => b.balance - a.balance)
  const bestMonth  = sortedByBalance[0]?.balance > 0  ? sortedByBalance[0].monthFull  : null
  const worstMonth = sortedByBalance[sortedByBalance.length - 1]?.balance < 0
    ? sortedByBalance[sortedByBalance.length - 1].monthFull : null

  const period: PeriodStats = {
    totalIncome:       periodIncome,
    totalExpense:      periodExpense,
    netBalance,
    savingsRate,
    avgMonthlyIncome:  nMonths > 0 ? periodIncome  / nMonths : 0,
    avgMonthlyExpense: nMonths > 0 ? periodExpense / nMonths : 0,
    positiveMonths:    monthly.filter(m => m.balance >= 0).length,
    totalMonths:       nMonths,
    bestMonth,
    worstMonth,
  }

  // ── Top 8 expenses ───────────────────────────────────────────────────────

  const topExpenses: TopExpense[] = allTxs
    .filter(t => t.type === 'EXPENSE')
    .slice(0, 8)
    .map(t => ({
      id:          t.id,
      description: t.description ?? 'Sem descrição',
      amount:      Number(t.amount),
      date:        format(t.date, 'dd/MM/yy'),
      category:    { name: t.category.name, icon: t.category.icon, color: t.category.color },
    }))

  // ── Spending by day-of-month ─────────────────────────────────────────────

  const dayMap = new Map<number, { total: number; count: number }>()
  for (const t of allTxs.filter(t => t.type === 'EXPENSE')) {
    const day = getDate(t.date)
    const cur = dayMap.get(day) ?? { total: 0, count: 0 }
    cur.total += Number(t.amount)
    cur.count++
    dayMap.set(day, cur)
  }
  const spendingByDay: DaySpending[] = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1
    return { day, ...(dayMap.get(day) ?? { total: 0, count: 0 }) }
  })

  // ── Category trend across all months ────────────────────────────────────

  const catMeta: Record<string, { name: string; icon: string; color: string }> = {}
  for (const t of allTxs.filter(t => t.type === 'EXPENSE')) {
    if (!catMeta[t.categoryId]) catMeta[t.categoryId] = { name: t.category.name, icon: t.category.icon, color: t.category.color }
  }

  const categoryTrend: CategoryTrend[] = Object.entries(catMeta).map(([categoryId, meta]) => {
    const monthTotals = monthly.map(m => {
      const found = m.categoryBreakdown.find(c => c.categoryId === categoryId)
      return found?.total ?? 0
    })
    const total = monthTotals.reduce((s, v) => s + v, 0)
    const pct   = periodExpense > 0 ? Math.round((total / periodExpense) * 100) : 0
    const last  = monthTotals[monthTotals.length - 1] ?? 0
    const prev  = monthTotals[monthTotals.length - 2] ?? null
    const delta = prev !== null && prev > 0 ? Math.round(((last - prev) / prev) * 100) : null

    return { categoryId, ...meta, total, pct, monthTotals, delta }
  }).sort((a, b) => b.total - a.total)

  // ── Income sources (by category) ────────────────────────────────────────

  const incCatMap: Record<string, { name: string; icon: string; color: string; total: number }> = {}
  for (const t of allTxs.filter(t => t.type === 'INCOME')) {
    if (!incCatMap[t.categoryId]) incCatMap[t.categoryId] = { name: t.category.name, icon: t.category.icon, color: t.category.color, total: 0 }
    incCatMap[t.categoryId].total += Number(t.amount)
  }
  const incomeSources: IncomeSource[] = Object.values(incCatMap)
    .map(c => ({ ...c, pct: periodIncome > 0 ? Math.round((c.total / periodIncome) * 100) : 0 }))
    .sort((a, b) => b.total - a.total)

  return { monthly, period, topExpenses, spendingByDay, categoryTrend, incomeSources }
}
