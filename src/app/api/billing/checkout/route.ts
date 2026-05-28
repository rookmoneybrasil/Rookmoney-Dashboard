import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'
  const returnUrl = `${origin}/settings`

  try {
    const { url } = await createCheckoutSession(session.userId, session.email, returnUrl)
    return NextResponse.json({ url })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
