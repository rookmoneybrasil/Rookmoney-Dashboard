import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const onlyPending = searchParams.get('onlyPending') === 'true'

  const rows = await db.bill.findMany({
    where: {
      userId,
      ...(onlyPending ? { isPaid: false } : {}),
    },
    include: { category: true },
    orderBy: [{ isPaid: 'asc' }, { dueDate: 'asc' }],
  })

  return NextResponse.json({
    data: rows.map((b) => ({
      id:         b.id,
      name:       b.name,
      amount:     Number(b.amount),
      dueDate:    b.dueDate.toISOString(),
      isPaid:     b.isPaid,
      isRecurring: b.isRecurring,
      notes:      b.notes,
      categoryId: b.categoryId,
      category:   b.category ? { id: b.category.id, name: b.category.name, icon: b.category.icon } : null,
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; amount?: number; dueDate?: string; isRecurring?: boolean; categoryId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, amount, dueDate, isRecurring, categoryId } = body
  if (!name)                        return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!amount || amount <= 0)       return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  if (!dueDate)                     return NextResponse.json({ error: 'dueDate required' }, { status: 400 })

  const bill = await db.bill.create({
    data: {
      name,
      amount,
      dueDate:     new Date(dueDate),
      isRecurring: isRecurring ?? false,
      userId,
      categoryId:  categoryId || null,
    },
  })

  return NextResponse.json({ data: { id: bill.id, name: bill.name, amount: Number(bill.amount), dueDate: bill.dueDate.toISOString() } }, { status: 201 })
}
