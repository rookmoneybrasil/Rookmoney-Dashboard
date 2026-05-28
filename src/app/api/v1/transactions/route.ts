import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const month      = searchParams.get('month')       // e.g. "2025-05"
  const typeRaw    = searchParams.get('type')         // "INCOME" | "EXPENSE"
  const type       = typeRaw === 'INCOME' || typeRaw === 'EXPENSE' ? typeRaw : undefined
  const categoryId = searchParams.get('categoryId')
  const limit      = Math.min(Number(searchParams.get('limit') || 50), 200)

  let dateFilter: { gte?: Date; lte?: Date } | undefined
  if (month) {
    const d = new Date(month + '-01')
    dateFilter = { gte: startOfMonth(d), lte: endOfMonth(d) }
  }

  const rows = await db.transaction.findMany({
    where: {
      userId,
      ...(dateFilter ? { date: dateFilter } : {}),
      ...(type ? { type: type as 'INCOME' | 'EXPENSE' } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true },
    orderBy: { date: 'desc' },
    take:    limit,
  })

  return NextResponse.json({
    data: rows.map((t) => ({
      id:          t.id,
      amount:      Number(t.amount),
      type:        t.type,
      description: t.description,
      date:        t.date.toISOString(),
      categoryId:  t.categoryId,
      category:    { id: t.category.id, name: t.category.name, icon: t.category.icon },
      createdAt:   t.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { amount?: number; type?: string; description?: string; date?: string; categoryId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { amount, type, description, date, categoryId } = body
  if (!amount || amount <= 0)                    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  if (type !== 'INCOME' && type !== 'EXPENSE')   return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  if (!categoryId)                               return NextResponse.json({ error: 'categoryId required' }, { status: 400 })

  const tx = await db.transaction.create({
    data: {
      amount,
      type:        type as 'INCOME' | 'EXPENSE',
      description: description || null,
      date:        date ? new Date(date) : new Date(),
      userId,
      categoryId,
    },
  })

  return NextResponse.json({ data: { id: tx.id, amount: Number(tx.amount), type: tx.type, date: tx.date.toISOString() } }, { status: 201 })
}
