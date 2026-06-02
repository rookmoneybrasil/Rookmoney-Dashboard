'use client'

import { Crown, Lock, Check, Minus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  feature:   string
  children?: React.ReactNode
  locked?:   boolean
  perks?:    string[]   // feature-specific benefits to highlight
}

const DEFAULT_PERKS = [
  'Transações, metas e contas ilimitadas',
  'Relatórios e projeção financeira',
  'Chat com Rookinho (IA)',
  'Importação de extratos CSV',
  'Orçamento por categoria',
]

export function ProGate({ feature, children, locked = true, perks = DEFAULT_PERKS }: Props) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative min-h-[320px]">
      {/* Blurred preview */}
      {children && (
        <div className="pointer-events-none select-none opacity-20 blur-sm" aria-hidden>
          {children}
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-ink-800/95 border border-amber-400/20 rounded-2xl overflow-hidden shadow-2xl flex backdrop-blur-sm">
          {/* Image side */}
          <div
            className="hidden md:block relative shrink-0"
            style={{ width: 220, background: 'linear-gradient(135deg, #1a3d8f22 0%, #080e1d 100%)' }}
          >
            <Image
              src="/rookinho-organizando.png"
              alt="Rookinho"
              fill
              sizes="220px"
              className="object-cover object-center"
            />
          </div>

          {/* Content side */}
          <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
                <Crown className="size-4 text-amber-400 fill-amber-400/30" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{feature} é exclusivo do PRO</p>
                <p className="text-xs text-slate-500">Desbloqueie por R$19,90/mês</p>
              </div>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {perks.map(p => (
                <li key={p} className="flex items-center gap-2 text-xs text-slate-300">
                  <Check className="size-3 text-success shrink-0" />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/billing"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-ink-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-all self-start shadow-lg shadow-amber-500/20"
            >
              <Crown className="size-4 fill-ink-900/20" />
              Assinar PRO
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline lock — for buttons/modals that are PRO-only
export function ProLock({ feature }: { feature: string }) {
  return (
    <Link
      href="/billing"
      title={`${feature} é exclusivo do plano PRO`}
      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
    >
      <Lock className="size-3.5" />
      <span className="font-medium">PRO</span>
    </Link>
  )
}
