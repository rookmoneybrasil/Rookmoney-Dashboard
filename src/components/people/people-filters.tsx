'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useCallback } from 'react'

type Filter = 'all' | 'they_owe' | 'i_owe' | 'settled'
type Sort   = 'name' | 'balance_asc' | 'balance_desc'

export function PeopleFilters({ filter, sort, search }: { filter: Filter; sort: Sort; search: string }) {
  const router = useRouter()
  const sp     = useSearchParams()

  const nav = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/people?${params.toString()}`)
  }, [router, sp])

  const filters: { value: Filter; label: string }[] = [
    { value: 'all',       label: 'Todos'      },
    { value: 'they_owe',  label: 'Me devem'   },
    { value: 'i_owe',     label: 'Eu devo'    },
    { value: 'settled',   label: 'Quitados'   },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar pessoa..."
          defaultValue={search}
          onChange={(e) => nav('search', e.target.value)}
          className="w-full h-9 bg-ink-800 border border-ink-600 rounded-lg pl-8 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-ink-800 border border-ink-600 rounded-lg p-1 shrink-0">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => nav('filter', f.value === 'all' ? '' : f.value)}
            className={`h-7 px-3 rounded-md text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-600 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SlidersHorizontal className="size-3.5 text-slate-500" />
        <select
          value={sort}
          onChange={(e) => nav('sort', e.target.value)}
          className="h-9 bg-ink-800 border border-ink-600 rounded-lg px-2 text-sm text-slate-300 focus:outline-none focus:border-brand-500 [color-scheme:dark] cursor-pointer"
        >
          <option value="name">A–Z</option>
          <option value="balance_desc">Maior saldo</option>
          <option value="balance_asc">Menor saldo</option>
        </select>
      </div>
    </div>
  )
}
