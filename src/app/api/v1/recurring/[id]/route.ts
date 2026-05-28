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

  const rec = await db.recurringTransaction.findFirst({ where: { id, userId } })
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { name?: string; amount?: number; isActive?: boolean; dayOfMonth?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const updated = await db.recurringTransaction.update({
    where: { id },
    data: {
      ...(body.name       !== undefined ? { name: body.name }             : {}),
      ...(body.amount     !== undefined ? { amount: body.amount }         : {}),
      ...(body.isActive   !== undefined ? { isActive: body.isActive }     : {}),
      ...(body.dayOfMonth !== undefined ? { dayOfMonth: body.dayOfMonth } : {}),
    },
    include: { category: true },
  })

  return NextResponse.json({
    data: {
      id:          updated.id,
      name:        updated.name,
      amount:      Number(updated.amount),
      type:        updated.type,
      frequency:   updated.frequency,
      dayOfMonth:  updated.dayOfMonth,
      description: updated.description,
      isActive:    updated.isActive,
      category: {
        id:   updated.category.id,
        name: updated.category.name,
        icon: updated.category.icon,
      },
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

  const rec = await db.recurringTransaction.findFirst({ where: { id, userId } })
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.recurringTransaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
