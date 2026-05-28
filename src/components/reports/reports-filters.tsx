'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function ReportsFilters({ month, months }: { month: string; months: number }) {
  const router = useRouter()
  const sp     = useSearchParams()

  function nav(key: string, value: string) {
    const params = new URLSearchParams(sp.toString())
    params.set(key, value)
    router.push(`/reports?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <input
        type="month"
        value={month}
        onChange={(e) => { if (e.target.value) nav('month', e.target.value) }}
        className="h-8 bg-ink-800 border border-ink-600 rounded-lg px-3 text-sm text-slate-300 focus:outline-none focus:border-brand-500 [color-scheme:dark] cursor-pointer"
      />
      <div className="flex items-center gap-1 bg-ink-800 border border-ink-600 rounded-lg p-1">
        {[3, 6, 12].map((n) => (
          <button
            key={n}
            onClick={() => nav('months', String(n))}
            className={`h-6 px-2.5 rounded-md text-xs font-medium transition-colors ${
              months === n
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {n}M
          </button>
        ))}
      </div>
    </div>
  )
}
