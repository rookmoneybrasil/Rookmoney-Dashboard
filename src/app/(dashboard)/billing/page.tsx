import { serverApi } from '@/lib/api-client'
import { BillingClient } from '@/components/billing/billing-client'

export default async function BillingPage() {
  const [user, settings] = await Promise.all([
    serverApi.me(),
    serverApi.settings(),
  ])
  return <BillingClient user={user} hasStripeSubscription={!!settings.stripeCustomerId} />
}
