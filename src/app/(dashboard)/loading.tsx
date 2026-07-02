function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink-700 ${className}`} />
}

// This is the Suspense fallback for every route under (dashboard) — both
// the very first load (before DashboardShell exists) AND every later
// sibling-page navigation (Contas -> Pessoas etc, where DashboardShell is
// already mounted and this renders *nested inside* its themed div).
//
// It must NOT set its own data-dashboard-theme here. An earlier version
// read the theme cookie itself and stamped its own attribute — during
// client-side navigation that read came back stale/mismatched with
// DashboardShell's live state, so this fallback would flash the *wrong*
// theme (e.g. a light skeleton inside an already-dark shell) on every
// single navigation. Left attribute-less, it just inherits whatever
// DashboardShell already applied — correct in the common (already
// mounted) case. The only remaining gap is the one-time cold load before
// DashboardShell mounts at all, where this briefly shows in dark (the
// CSS default) — a single acceptable flash, not a recurring one.
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-ink-900 p-4 lg:p-6">
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
