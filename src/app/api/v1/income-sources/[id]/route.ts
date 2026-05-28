import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const source = await db.incomeSource.findFirst({ where: { id, userId } })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { name?: string; amount?: number; isRecurring?: boolean; dayOfMonth?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const updated = await db.incomeSource.update({
    where: { id },
    data: {
      ...(body.name        !== undefined ? { name: body.name }             : {}),
      ...(body.amount      !== undefined ? { amount: body.amount }         : {}),
      ...(body.isRecurring !== undefined ? { isRecurring: body.isRecurring } : {}),
      ...(body.dayOfMonth  !== undefined ? { dayOfMonth: body.dayOfMonth } : {}),
    },
  })

  return NextResponse.json({
    data: {
      id:          updated.id,
      name:        updated.name,
      type:        updated.type,
      amount:      Number(updated.amount),
      isRecurring: updated.isRecurring,
      dayOfMonth:  updated.dayOfMonth,
      notes:       updated.notes,
    },
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const source = await db.incomeSource.findFirst({ where: { id, userId } })
  if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.incomeSource.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
