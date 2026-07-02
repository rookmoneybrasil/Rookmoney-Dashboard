'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { WithTooltip } from '@/components/ui/tooltip'

interface Category {
  id: string
  name: string
  icon: string
}

interface Props {
  categories: Category[]
  totalCount: number
}

const TYPE_OPTIONS = [
  { value: 'ALL',     label: 'Todos',    tooltip: 'Exibir todas as transações' },
  { value: 'EXPENSE', label: 'Despesas', tooltip: 'Apenas saídas de dinheiro'  },
  { value: 'INCOME',  label: 'Receitas', tooltip: 'Apenas entradas de dinheiro' },
]

export function TransactionFilters({ categories, totalCount }: Props) {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const createQS = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (!v) params.delete(k)
        else params.set(k, v)
      }
      // Any filter change resets pagination — otherwise a stale page=N
      // (from before the filter narrowed the results) leaves the user on an
      // out-of-range page showing the empty "Nenhuma transação encontrada"
      // state with no pagination bar to escape it.
      params.delete('page')
      return params.toString()
    },
    [searchParams],
  )

  const update = (key: string, value: string | null) => {
    startTransition(() => {
      router.push(`${pathname}?${createQS({ [key]: value })}`, { scroll: false })
    })
  }

  const type       = searchParams.get('type')       ?? 'ALL'
  const search     = searchParams.get('search')     ?? ''
  const categoryId = searchParams.get('categoryId') ?? ''
  const month      = searchParams.get('month')      ?? ''
  const hasFilters = type !== 'ALL' || search || categoryId || month

  const selectedCat = categories.find((c) => c.id === categoryId)

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: search + month + count + clear */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-ink-800 border border-ink-600 rounded-lg px-3 h-9 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/30 transition-all">
          <Search className="size-4 text-slate-600 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={search}
            onChange={(e) => update('search', e.target.value || null)}
            className="flex-1 bg-transparent text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none"
          />
          {search && (
            <button onClick={() => update('search', null)} className="text-slate-600 hover:text-slate-400 transition-colors">
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Month picker */}
        <WithTooltip content="Filtrar por mês" side="bottom">
          <input
            type="month"
            value={month}
            onChange={(e) => update('month', e.target.value || null)}
            className="h-9 bg-ink-800 border border-ink-600 rounded-lg px-3 text-sm text-slate-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 [color-scheme:dark] transition-all cursor-pointer"
          />
        </WithTooltip>

        {/* Result count */}
        <span className="text-xs text-slate-600 ml-auto">
          {totalCount} resultado{totalCount !== 1 ? 's' : ''}
        </span>

        {/* Clear all */}
        {hasFilters && (
          <WithTooltip content="Limpar todos os filtros">
            <button
              onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
              className="h-9 px-3 rounded-lg text-sm text-slate-500 hover:text-slate-200 hover:bg-ink-700 transition-colors flex items-center gap-1.5 border border-transparent hover:border-ink-500"
            >
              <X className="size-3.5" />
              Limpar
            </button>
          </WithTooltip>
        )}
      </div>

      {/* Row 2: type pills + category dropdown */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal className="size-3.5 text-slate-600 shrink-0" />

        {TYPE_OPTIONS.map((opt) => (
          <WithTooltip key={opt.value} content={opt.tooltip} side="bottom">
            <button
              onClick={() => update('type', opt.value === 'ALL' ? null : opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                type === opt.value
                  ? 'bg-brand-800 text-brand-300 border border-brand-700/50'
                  : 'text-slate-500 hover:bg-ink-700 hover:text-slate-300 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          </WithTooltip>
        ))}

        {/* Category dropdown */}
        {categories.length > 0 && (
          <>
            <div className="h-4 w-px bg-ink-600 mx-1 shrink-0" />
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => update('categoryId', e.target.value || null)}
                className={`h-9 pl-3 pr-8 rounded-lg text-sm font-medium appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-brand-500/30 ${
                  categoryId
                    ? 'bg-ink-600 text-slate-200 border border-white/15'
                    : 'bg-ink-800 border border-ink-600 text-slate-500 hover:bg-ink-700 hover:text-slate-300'
                }`}
              >
                <option value="">Categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
            </div>

            {/* Active category badge */}
            {selectedCat && (
              <span className="flex items-center gap-1 text-xs text-slate-400 bg-ink-700 border border-ink-500 px-2 py-1 rounded-lg">
                {selectedCat.icon} {selectedCat.name}
                <button onClick={() => update('categoryId', null)} className="text-slate-600 hover:text-slate-300 transition-colors ml-0.5">
                  <X className="size-3" />
                </button>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
