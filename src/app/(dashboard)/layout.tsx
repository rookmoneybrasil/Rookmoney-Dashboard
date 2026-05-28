import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, unpaidBills, openPeople] = await Promise.all([
    db.user.findUnique({
      where:  { id: session.userId },
      select: { hasOnboarded: true },
    }),
    db.bill.count({
      where: { userId: session.userId, isPaid: false },
    }),
    db.person.count({
      where: { userId: session.userId, entries: { some: { isSettled: false } } },
    }),
  ])

  if (user && !user.hasOnboarded) redirect('/onboarding')

  const badges: Record<string, number> = {}
  if (unpaidBills > 0) badges['/bills']  = unpaidBills
  if (openPeople  > 0) badges['/people'] = openPeople

  return (
    <DashboardShell
      user={{ name: session.name, email: session.email }}
      badges={badges}
      header={<Header />}
    >
      {children}
    </DashboardShell>
  )
}
