function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink-700 ${className}`} />
}

export default function DashboardLoading() {
  return (
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
  )
}
