import { cookies } from 'next/headers'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink-700 ${className}`} />
}

export default async function DashboardLoading() {
  // This Suspense fallback renders before DashboardShell mounts, so it can't
  // read the theme from React context or localStorage — without this, it
  // always painted dark, causing a dark->light flash on every navigation
  // for users on the (now-default) light theme. Same cookie DashboardShell
  // seeds its initial state from (see (dashboard)/layout.tsx).
  const cookieStore = await cookies()
  const theme = cookieStore.get('rook-dashboard-theme')?.value === 'dark' ? 'dark' : 'light'

  return (
    // Full-bleed bg so <body>'s own (always-dark) background can't peek
    // through around this centered block while the theme is light.
    <div className="min-h-screen bg-ink-900 p-4 lg:p-6" data-dashboard-theme={theme}>
      <div className="flex flex-col gap-5 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>

        {/* Main content block */}
        <Skeleton className="h-64" />

        {/* Secondary block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  )
}
