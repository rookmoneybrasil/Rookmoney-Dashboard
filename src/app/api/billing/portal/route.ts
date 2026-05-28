import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createBillingPortal } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where:  { id: session.userId },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
  }

  const origin    = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
  const returnUrl = `${origin}/settings`

  try {
    const { url } = await createBillingPortal(user.stripeCustomerId, returnUrl)
    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
