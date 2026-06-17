'use client'

import { AlertTriangle, X } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export function ImpersonationBanner({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="size-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-300">
          <span className="font-semibold">Modo somente leitura</span> — você está navegando como{' '}
          <span className="font-semibold">{name}</span>. Modificações estão bloqueadas.
        </p>
      </div>
      <button
        onClick={() => logout()}
        className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <X className="size-3" /> Encerrar
      </button>
    </div>
  )
}
