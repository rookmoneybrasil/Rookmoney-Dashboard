import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.recurringTransaction.findMany({
    where:   { userId },
    include: { category: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json({
    data: rows.map((r) => ({
      id:          r.id,
      name:        r.name,
      amount:      Number(r.amount),
      type:        r.type,
      frequency:   r.frequency,
      dayOfMonth:  r.dayOfMonth,
      description: r.description,
      isActive:    r.isActive,
      category: {
        id:   r.category.id,
        name: r.category.name,
        icon: r.category.icon,
      },
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name?: string
    amount?: number
    type?: string
    frequency?: string
    dayOfMonth?: number
    categoryId?: string
    description?: string
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, amount, type, frequency, dayOfMonth, categoryId, description } = body

  if (!name)                  return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  if (!categoryId)            return NextResponse.json({ error: 'categoryId required' }, { status: 400 })

  if (type !== 'INCOME' && type !== 'EXPENSE') {
    return NextResponse.json({ error: 'type must be INCOME or EXPENSE' }, { status: 400 })
  }

  const validFreqs = ['WEEKLY', 'MONTHLY', 'YEARLY']
  if (!frequency || !validFreqs.includes(frequency)) {
    return NextResponse.json({ error: 'frequency must be WEEKLY, MONTHLY, or YEARLY' }, { status: 400 })
  }

  const rec = await db.recurringTransaction.create({
    data: {
      name,
      amount,
      type:        type as 'INCOME' | 'EXPENSE',
      frequency:   frequency as 'WEEKLY' | 'MONTHLY' | 'YEARLY',
      dayOfMonth:  dayOfMonth ?? null,
      description: description || null,
      userId,
      categoryId,
    },
    include: { category: true },
  })

  return NextResponse.json({
    data: {
      id:          rec.id,
      name:        rec.name,
      amount:      Number(rec.amount),
      type:        rec.type,
      frequency:   rec.frequency,
      dayOfMonth:  rec.dayOfMonth,
      description: rec.description,
      isActive:    rec.isActive,
      category: {
        id:   rec.category.id,
        name: rec.category.name,
        icon: rec.category.icon,
      },
    },
  }, { status: 201 })
}
