import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.goal.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    data: rows.map((g) => ({
      id:            g.id,
      name:          g.name,
      targetAmount:  Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      deadline:      g.deadline?.toISOString() ?? null,
      description:   g.description,
      icon:          g.icon,
      isCompleted:   g.isCompleted,
      createdAt:     g.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    name?: string
    targetAmount?: number
    currentAmount?: number
    deadline?: string
    description?: string
    icon?: string
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, targetAmount, currentAmount, deadline, description, icon } = body
  if (!name)                            return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!targetAmount || targetAmount <= 0) return NextResponse.json({ error: 'Invalid targetAmount' }, { status: 400 })

  const goal = await db.goal.create({
    data: {
      name,
      targetAmount,
      currentAmount: currentAmount ?? 0,
      deadline:      deadline ? new Date(deadline) : null,
      description:   description || null,
      icon:          icon || null,
      userId,
    },
  })

  return NextResponse.json({
    data: {
      id:            goal.id,
      name:          goal.name,
      targetAmount:  Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
    },
  }, { status: 201 })
}
