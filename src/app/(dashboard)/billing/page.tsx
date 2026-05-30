import { serverApi } from '@/lib/api-client'
import { BillingClient } from '@/components/billing/billing-client'

export default async function BillingPage() {
  const user = await serverApi.me()
  return <BillingClient user={user} />
}
