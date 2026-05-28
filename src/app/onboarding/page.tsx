import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata = { title: 'Configurar conta' }

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where:  { id: session.userId },
    select: { hasOnboarded: true, name: true },
  })

  if (user?.hasOnboarded) redirect('/dashboard')

  const firstName = (user?.name ?? session.name).split(' ')[0]

  return <OnboardingWizard firstName={firstName} />
}
