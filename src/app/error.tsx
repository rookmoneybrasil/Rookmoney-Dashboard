'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function GlobalError({
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
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center text-center px-4">
      <div className="relative h-16 w-16 mb-6 opacity-60">
        <Image src="/SVG/FAVICON.svg" alt="Rook" fill className="object-contain" />
      </div>
      <p className="text-5xl font-bold text-danger/60 mb-4">Ops</p>
      <h1 className="text-xl font-semibold text-slate-200 mb-2">Algo deu errado</h1>
      <p className="text-sm text-slate-500 max-w-xs mb-2">
        Ocorreu um erro inesperado. Tente novamente ou volte ao Dashboard.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-700 mb-6 font-mono">ref: {error.digest}</p>
      )}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-ink-700 hover:bg-ink-600 border border-ink-500 text-slate-300 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          Ir ao Dashboard
        </Link>
      </div>
    </div>
  )
}
