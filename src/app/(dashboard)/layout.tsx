import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api-client'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Header } from '@/components/layout/header'
import { LimitBanner } from '@/components/ui/limit-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user
  try {
    user = await serverApi.me()
  } catch {
    redirect('/login')
  }

  if (!user.hasOnboarded) redirect('/onboarding')

  const badges: Record<string, number> = {}
  if (user.badges) {
    Object.entries(user.badges).forEach(([path, count]) => {
      if (count > 0) badges[path] = count
    })
  }

  const showLimitBanner = user.plan !== 'PRO' && user.usage && user.limits

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email }}
      badges={badges}
      plan={user.plan}
      header={<Header />}
    >
      {showLimitBanner && user.usage && user.limits && (
        <div className="px-4 lg:px-6 pt-4">
          <LimitBanner usage={user.usage} limits={user.limits} />
        </div>
      )}
      {children}
    </DashboardShell>
  )
}
