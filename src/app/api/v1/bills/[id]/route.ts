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

  const bill = await db.bill.findFirst({ where: { id, userId } })
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { isPaid?: boolean; name?: string; amount?: number; dueDate?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const updated = await db.bill.update({
    where: { id },
    data: {
      ...(body.isPaid !== undefined ? { isPaid: body.isPaid, paidAt: body.isPaid ? new Date() : null } : {}),
      ...(body.name   !== undefined ? { name: body.name }   : {}),
      ...(body.amount !== undefined ? { amount: body.amount } : {}),
      ...(body.dueDate !== undefined ? { dueDate: new Date(body.dueDate) } : {}),
    },
  })

  return NextResponse.json({
    data: {
      id:      updated.id,
      name:    updated.name,
      amount:  Number(updated.amount),
      dueDate: updated.dueDate.toISOString(),
      isPaid:  updated.isPaid,
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

  const bill = await db.bill.findFirst({ where: { id, userId } })
  if (!bill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.bill.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
