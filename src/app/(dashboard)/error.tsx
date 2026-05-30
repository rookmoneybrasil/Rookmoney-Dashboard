'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-5 max-w-sm mx-auto">
      <div className="size-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-100">Algo deu errado</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Ocorreu um erro ao carregar esta página. Tente novamente.
        </p>
        <p className="text-xs text-slate-700 font-mono mt-1 break-all">
          {error.message || error.digest || 'Erro desconhecido'}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-ink-700 hover:bg-ink-600 border border-ink-500 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        <RefreshCw className="size-4" />
        Tentar novamente
      </button>
    </div>
  )
}
