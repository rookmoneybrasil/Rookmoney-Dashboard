import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const goal = await db.goal.findFirst({ where: { id, userId } })
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { amount?: number; note?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { amount, note } = body
  if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  // Create contribution
  await db.goalContribution.create({
    data: { goalId: id, amount, note: note || null },
  })

  // Update goal's currentAmount
  const newCurrent = Number(goal.currentAmount) + amount
  const isCompleted = newCurrent >= Number(goal.targetAmount)

  const updated = await db.goal.update({
    where: { id },
    data: {
      currentAmount: newCurrent,
      ...(isCompleted && !goal.isCompleted ? { isCompleted: true, completedAt: new Date() } : {}),
    },
  })

  return NextResponse.json({
    data: {
      id:            updated.id,
      currentAmount: Number(updated.currentAmount),
      targetAmount:  Number(updated.targetAmount),
      isCompleted:   updated.isCompleted,
      completedAt:   updated.completedAt?.toISOString() ?? null,
    },
  })
}
