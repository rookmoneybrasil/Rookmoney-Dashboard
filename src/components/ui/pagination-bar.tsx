'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
}

export function PaginationBar({ page, totalPages }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  if (totalPages <= 1) return null

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="flex items-center gap-2 justify-center py-4 text-sm text-slate-400">
      <button
        onClick={() => navigate(page - 1)}
        disabled={page <= 1}
        className="size-8 rounded-lg flex items-center justify-center hover:bg-ink-700 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="tabular-nums">
        Página {page} de {totalPages}
      </span>

      <button
        onClick={() => navigate(page + 1)}
        disabled={page >= totalPages}
        className="size-8 rounded-lg flex items-center justify-center hover:bg-ink-700 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
