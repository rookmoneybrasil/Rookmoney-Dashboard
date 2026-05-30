'use client'

import { Crown, Lock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  feature:  string
  children?: React.ReactNode
  locked?:  boolean   // if false, renders children normally
}

export function ProGate({ feature, children, locked = true }: Props) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      {/* Blurred preview */}
      {children && (
        <div className="pointer-events-none select-none opacity-30 blur-sm" aria-hidden>
          {children}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/60 rounded-xl">
        <div className="size-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
          <Crown className="size-6 text-amber-400 fill-amber-400/20" />
        </div>
        <div className="text-center px-6">
          <p className="text-sm font-semibold text-slate-100">{feature} é PRO</p>
          <p className="text-xs text-slate-500 mt-1">Faça upgrade para desbloquear</p>
        </div>
        <Link
          href="/settings?tab=billing"
          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-ink-900 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
        >
          <Crown className="size-3.5 fill-ink-900" />
          Assinar PRO — R$19,90/mês
        </Link>
      </div>
    </div>
  )
}

// Inline lock — for buttons/modals that are PRO-only
export function ProLock({ feature }: { feature: string }) {
  return (
    <Link
      href="/settings?tab=billing"
      title={`${feature} é exclusivo do plano PRO`}
      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
    >
      <Lock className="size-3.5" />
      <span className="font-medium">PRO</span>
    </Link>
  )
}
