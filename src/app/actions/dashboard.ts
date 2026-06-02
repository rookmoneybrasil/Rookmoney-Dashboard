'use server'

import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

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
          month:             format(d, 'MMM/yy'),
          monthFull:         format(d, 'MMMM yyyy'),
          totalIncome:       income,
          totalExpense:      expense,
          balance:           income - expense,
          categoryBreakdown: Object.values(byCat)
            .map(c => ({ ...c, pct: expense > 0 ? Math.round((c.total / expense) * 100) : 0 }))
            .sort((a, b) => b.total - a.total),
        }
      })
    })
  )

  return monthly
}
