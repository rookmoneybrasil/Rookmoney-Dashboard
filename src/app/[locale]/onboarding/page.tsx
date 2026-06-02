import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api-client'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata = { title: 'Configurar conta' }

export default async function OnboardingPage() {
  let user
  try {
    user = await serverApi.me()
  } catch {
    redirect('/login')
  }

  if (user.hasOnboarded) redirect('/dashboard')

  const firstName = user.name.split(' ')[0]

  return <OnboardingWizard firstName={firstName} />
}
