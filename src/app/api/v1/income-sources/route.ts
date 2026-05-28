import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.incomeSource.findMany({
    where:   { userId },
    orderBy: [{ isRecurring: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json({
    data: rows.map((s) => ({
      id:          s.id,
      name:        s.name,
      type:        s.type,
      amount:      Number(s.amount),
      isRecurring: s.isRecurring,
      dayOfMonth:  s.dayOfMonth,
      categoryId:  s.categoryId,
      notes:       s.notes,
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; type?: string; amount?: number; isRecurring?: boolean; dayOfMonth?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, type, amount, isRecurring, dayOfMonth } = body
  if (!name)                  return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const validTypes = ['EMPLOYMENT', 'FREELANCE', 'RENTAL', 'OTHER']
  if (!type || !validTypes.includes(type)) {
    return NextResponse.json({ error: 'type must be one of: ' + validTypes.join(', ') }, { status: 400 })
  }

  const source = await db.incomeSource.create({
    data: {
      name,
      type:        type as 'EMPLOYMENT' | 'FREELANCE' | 'RENTAL' | 'OTHER',
      amount,
      isRecurring: isRecurring ?? true,
      dayOfMonth:  dayOfMonth ?? null,
      userId,
    },
  })

  return NextResponse.json({
    data: { id: source.id, name: source.name, amount: Number(source.amount), type: source.type },
  }, { status: 201 })
}
