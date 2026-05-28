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

  const budget = await db.budget.findFirst({ where: { id, userId } })
  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { amount?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (body.amount !== undefined && body.amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const updated = await db.budget.update({
    where: { id },
    data: {
      ...(body.amount !== undefined ? { amount: body.amount } : {}),
    },
    include: { category: true },
  })

  return NextResponse.json({
    data: {
      id:         updated.id,
      categoryId: updated.categoryId,
      category: {
        id:    updated.category.id,
        name:  updated.category.name,
        icon:  updated.category.icon,
        color: updated.category.color,
      },
      amount: Number(updated.amount),
      month:  updated.month,
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

  const budget = await db.budget.findFirst({ where: { id, userId } })
  if (!budget) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.budget.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
