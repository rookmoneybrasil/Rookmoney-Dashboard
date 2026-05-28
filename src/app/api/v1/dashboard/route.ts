import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now        = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd   = endOfMonth(now)

  const [monthTxs, recentTxs, upcomingBills] = await Promise.all([
    db.transaction.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
    }),
    db.transaction.findMany({
      where:   { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take:    5,
    }),
    db.bill.findMany({
      where: {
        userId,
        isPaid:  false,
        dueDate: { lte: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { dueDate: 'asc' },
      take:    3,
    }),
  ])

  const monthIncome  = monthTxs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)
  const monthBalance = monthIncome - monthExpense

  return NextResponse.json({
    data: {
      monthBalance,
      monthIncome,
      monthExpense,
      recentTransactions: recentTxs.map((t) => ({
        id:          t.id,
        amount:      Number(t.amount),
        type:        t.type,
        description: t.description,
        date:        t.date.toISOString(),
        category:    { id: t.category.id, name: t.category.name, icon: t.category.icon },
      })),
      upcomingBills: upcomingBills.map((b) => ({
        id:      b.id,
        name:    b.name,
        amount:  Number(b.amount),
        dueDate: b.dueDate.toISOString(),
        isPaid:  b.isPaid,
      })),
    },
  })
}
