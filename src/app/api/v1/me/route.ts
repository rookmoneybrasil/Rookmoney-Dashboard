import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where:  { id: userId },
    select: { id: true, name: true, email: true, plan: true, createdAt: true },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    data: {
      id:        user.id,
      name:      user.name,
      email:     user.email,
      plan:      user.plan,
      createdAt: user.createdAt.toISOString(),
    },
  })
}
