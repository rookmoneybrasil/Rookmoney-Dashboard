import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const month = searchParams.get('month') ?? new Date().toISOString().slice(0, 7) // "YYYY-MM"

  const budgets = await db.budget.findMany({
    where: { userId, month },
    include: { category: true },
    orderBy: { category: { name: 'asc' } },
  })

  // Calculate spent per category for the month
  const monthDate = new Date(month + '-01')
  const dateFilter = { gte: startOfMonth(monthDate), lte: endOfMonth(monthDate) }

  const spentByCategory = await db.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      type: 'EXPENSE',
      date: dateFilter,
      categoryId: { in: budgets.map((b) => b.categoryId) },
    },
    _sum: { amount: true },
  })

  const spentMap = new Map(spentByCategory.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]))

  return NextResponse.json({
    data: budgets.map((b) => ({
      id:         b.id,
      categoryId: b.categoryId,
      category: {
        id:    b.category.id,
        name:  b.category.name,
        icon:  b.category.icon,
        color: b.category.color,
      },
      amount:  Number(b.amount),
      month:   b.month,
      spent:   spentMap.get(b.categoryId) ?? 0,
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { categoryId?: string; amount?: number; month?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { categoryId, amount, month } = body
  if (!categoryId)                return NextResponse.json({ error: 'categoryId required' }, { status: 400 })
  if (!amount || amount <= 0)     return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  if (!month)                     return NextResponse.json({ error: 'month required (YYYY-MM)' }, { status: 400 })

  // Upsert: if budget for this category+month already exists, update it
  const budget = await db.budget.upsert({
    where:  { userId_categoryId_month: { userId, categoryId, month } },
    create: { userId, categoryId, amount, month },
    update: { amount },
    include: { category: true },
  })

  return NextResponse.json({
    data: {
      id:         budget.id,
      categoryId: budget.categoryId,
      category: {
        id:    budget.category.id,
        name:  budget.category.name,
        icon:  budget.category.icon,
        color: budget.category.color,
      },
      amount: Number(budget.amount),
      month:  budget.month,
      spent:  0,
    },
  }, { status: 201 })
}
