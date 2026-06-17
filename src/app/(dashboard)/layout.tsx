import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api-client'
import { getSession } from '@/lib/auth'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Header } from '@/components/layout/header'
import { LimitBanner } from '@/components/ui/limit-banner'
import { ImpersonationBanner } from '@/components/ui/impersonation-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user
  try {
    user = await serverApi.me()
  } catch {
    redirect('/login')
  }

  if (!user.hasOnboarded) redirect('/onboarding')

  const session = await getSession()
  const isImpersonating = session?.impersonating === true

  const badges: Record<string, number> = {}
  if (user.badges) {
    Object.entries(user.badges).forEach(([path, count]) => {
      if (count > 0) badges[path] = count
    })
  }

  const showLimitBanner = !isImpersonating && user.plan !== 'PRO' && user.usage && user.limits

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email, image: user.profileImage ?? undefined }}
      badges={badges}
      plan={user.plan}
      header={<Header />}
      banner={isImpersonating
        ? <ImpersonationBanner name={user.name} />
        : (showLimitBanner && user.usage && user.limits
          ? <LimitBanner usage={user.usage} limits={user.limits} />
          : undefined)
      }
    >
      {children}
    </DashboardShell>
  )
}
