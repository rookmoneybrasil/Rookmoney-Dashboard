'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Crown, Check } from 'lucide-react'

const STORAGE_KEY = 'rook_upsell_shown'
const DELAY_MS    = 8_000

const PERKS = [
  'Transações, contas e metas ilimitadas',
  'Rookinho IA — seu assistente financeiro',
  'Relatórios e projeção financeira',
  'Orçamento por categoria e importação CSV',
]

export function UpsellModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => {
      setOpen(true)
      sessionStorage.setItem(STORAGE_KEY, '1')
    }, DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-xs bg-ink-800 border border-white/8 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-20 size-7 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="size-3.5" />
        </button>

        <div className="flex flex-col gap-5 p-6 pt-7">
          {/* Header */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className="size-3.5 text-amber-400 fill-amber-400/30" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Rook Money PRO</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              Suas finanças<br />sem limites
            </h2>
            <p className="text-sm text-slate-400 mt-1.5">
              A partir de <span className="text-white font-semibold">R$19,90/mês</span> — cancele quando quiser.
            </p>
          </div>

          {/* Perks */}
          <ul className="flex flex-col gap-2.5">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="size-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-success" />
                </div>
                {p}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/20"
            >
              <Crown className="size-4 fill-white/20" />
              Ver planos
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors text-center py-1"
            >
              Continuar no plano gratuito
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
