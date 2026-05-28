import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const months = Math.min(Math.max(Number(searchParams.get('months') || 6), 1), 24)

  const now = new Date()
  const results = []

  for (let i = months - 1; i >= 0; i--) {
    const monthDate  = subMonths(now, i)
    const monthLabel = format(monthDate, 'yyyy-MM')
    const start      = startOfMonth(monthDate)
    const end        = endOfMonth(monthDate)

    // Aggregate transactions for this month
    const txs = await db.transaction.findMany({
      where:   { userId, date: { gte: start, lte: end } },
      include: { category: true },
    })

    let totalIncome  = 0
    let totalExpense = 0
    const categoryTotals = new Map<string, { name: string; icon: string; color: string; total: number }>()

    for (const tx of txs) {
      const amt = Number(tx.amount)
      if (tx.type === 'INCOME') {
        totalIncome += amt
      } else {
        totalExpense += amt
        const key = tx.categoryId
        const existing = categoryTotals.get(key)
        if (existing) {
          existing.total += amt
        } else {
          categoryTotals.set(key, {
            name:  tx.category.name,
            icon:  tx.category.icon,
            color: tx.category.color,
            total: amt,
          })
        }
      }
    }

    const categoryBreakdown = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)
      .map((c) => ({
        name:  c.name,
        icon:  c.icon,
        color: c.color,
        total: c.total,
        pct:   totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0,
      }))

    results.push({
      month:             monthLabel,
      totalIncome,
      totalExpense,
      balance:           totalIncome - totalExpense,
      categoryBreakdown,
    })
  }

  return NextResponse.json({ data: results })
}
