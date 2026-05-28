import { redirect } from 'next/navigation'
import { serverApi } from '@/lib/api-client'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Header } from '@/components/layout/header'

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

  return (
    <DashboardShell
      user={{ name: user.name, email: user.email }}
      badges={badges}
      header={<Header />}
    >
      {children}
    </DashboardShell>
  )
}
