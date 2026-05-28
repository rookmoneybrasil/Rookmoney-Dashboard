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

  const tx = await db.transaction.findFirst({ where: { id, userId } })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { amount?: number; type?: string; description?: string; date?: string; categoryId?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.type && body.type !== 'INCOME' && body.type !== 'EXPENSE') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const updated = await db.transaction.update({
    where: { id },
    data: {
      ...(body.amount      !== undefined ? { amount: body.amount }                    : {}),
      ...(body.type        !== undefined ? { type: body.type as 'INCOME' | 'EXPENSE' } : {}),
      ...(body.description !== undefined ? { description: body.description }          : {}),
      ...(body.date        !== undefined ? { date: new Date(body.date) }              : {}),
      ...(body.categoryId  !== undefined ? { categoryId: body.categoryId }            : {}),
    },
    include: { category: true },
  })

  return NextResponse.json({
    data: {
      id:          updated.id,
      amount:      Number(updated.amount),
      type:        updated.type,
      description: updated.description,
      date:        updated.date.toISOString(),
      categoryId:  updated.categoryId,
      category:    { id: updated.category.id, name: updated.category.name, icon: updated.category.icon },
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

  const tx = await db.transaction.findFirst({ where: { id, userId } })
  if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.transaction.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
