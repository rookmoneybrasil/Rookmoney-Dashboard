import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId },
      ],
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json({
    data: rows.map((c) => ({
      id:        c.id,
      name:      c.name,
      icon:      c.icon,
      color:     c.color,
      isDefault: c.isDefault,
    })),
  })
}

export async function POST(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { name?: string; icon?: string; color?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { name, icon, color } = body
  if (!name)  return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (!icon)  return NextResponse.json({ error: 'icon required' }, { status: 400 })
  if (!color) return NextResponse.json({ error: 'color required' }, { status: 400 })

  const category = await db.category.create({
    data: { name, icon, color, isDefault: false, userId },
  })

  return NextResponse.json({
    data: {
      id:        category.id,
      name:      category.name,
      icon:      category.icon,
      color:     category.color,
      isDefault: category.isDefault,
    },
  }, { status: 201 })
}
