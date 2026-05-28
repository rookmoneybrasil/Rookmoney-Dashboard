import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHmac, timingSafeEqual } from 'crypto'

function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  try {
    const parts   = sigHeader.split(',').reduce<Record<string, string>>((acc, part) => {
      const [key, val] = part.split('=')
      acc[key] = val
      return acc
    }, {})

    const timestamp = parts['t']
    const signature = parts['v1']
    if (!timestamp || !signature) return false

    const signedPayload = `${timestamp}.${payload}`
    const expected      = createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex')
    const expectedBuf   = Buffer.from(expected, 'hex')
    const actualBuf     = Buffer.from(signature, 'hex')

    if (expectedBuf.length !== actualBuf.length) return false
    return timingSafeEqual(expectedBuf, actualBuf)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const rawBody  = await req.text()
  const sigHeader = req.headers.get('stripe-signature') ?? ''

  if (!verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { type: string; data: { object: Record<string, unknown> } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const obj = event.data.object

  if (event.type === 'checkout.session.completed') {
    const userId             = (obj['metadata'] as Record<string, string>)?.['userId']
    const customerId         = obj['customer'] as string | null
    const subscriptionId     = obj['subscription'] as string | null

    if (userId) {
      await db.user.update({
        where: { id: userId },
        data:  {
          plan:                 'PRO',
          stripeCustomerId:     customerId     ?? undefined,
          stripeSubscriptionId: subscriptionId ?? undefined,
        },
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = obj['customer'] as string | null
    if (customerId) {
      await db.user.updateMany({
        where: { stripeCustomerId: customerId },
        data:  { plan: 'FREE', stripeSubscriptionId: null },
      })
    }
  }

  return NextResponse.json({ received: true })
}
