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

  const goal = await db.goal.findFirst({ where: { id, userId } })
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: { name?: string; targetAmount?: number; deadline?: string; description?: string; icon?: string; color?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const updated = await db.goal.update({
    where: { id },
    data: {
      ...(body.name         !== undefined ? { name: body.name }                        : {}),
      ...(body.targetAmount !== undefined ? { targetAmount: body.targetAmount }        : {}),
      ...(body.deadline     !== undefined ? { deadline: body.deadline ? new Date(body.deadline) : null } : {}),
      ...(body.description  !== undefined ? { description: body.description }          : {}),
      ...(body.icon         !== undefined ? { icon: body.icon }                        : {}),
      ...(body.color        !== undefined ? { color: body.color }                      : {}),
    },
  })

  return NextResponse.json({
    data: {
      id:            updated.id,
      name:          updated.name,
      targetAmount:  Number(updated.targetAmount),
      currentAmount: Number(updated.currentAmount),
      deadline:      updated.deadline?.toISOString() ?? null,
      description:   updated.description,
      icon:          updated.icon,
      color:         updated.color,
      isCompleted:   updated.isCompleted,
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

  const goal = await db.goal.findFirst({ where: { id, userId } })
  if (!goal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.goal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
