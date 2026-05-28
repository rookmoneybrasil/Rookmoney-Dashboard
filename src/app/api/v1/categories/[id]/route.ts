import { NextRequest, NextResponse } from 'next/server'
import { verifyApiToken } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyApiToken(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const category = await db.category.findFirst({ where: { id } })
  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Only allow deleting user-owned (non-default) categories belonging to this user
  if (category.isDefault) {
    return NextResponse.json({ error: 'Cannot delete default categories' }, { status: 403 })
  }
  if (category.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
