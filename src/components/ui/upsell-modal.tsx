'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Crown, Zap, BarChart3, Bot, Upload, Infinity, Star } from 'lucide-react'

const PERKS = [
  { icon: Infinity,  text: 'Transações e contas ilimitadas' },
  { icon: BarChart3, text: 'Relatórios e projeção financeira' },
  { icon: Bot,       text: 'Chat com IA — Rookinho' },
  { icon: Upload,    text: 'Importar extratos CSV' },
  { icon: Star,      text: 'Orçamento por categoria' },
]

const STORAGE_KEY = 'rook_upsell_shown'
const DELAY_MS    = 8_000  // 8s depois de abrir o dashboard

export function UpsellModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Show once per day at most
    const lastShown = localStorage.getItem(STORAGE_KEY)
    const now       = Date.now()
    if (lastShown && now - Number(lastShown) < 24 * 60 * 60 * 1000) return

    const timer = setTimeout(() => {
      setOpen(true)
      localStorage.setItem(STORAGE_KEY, String(now))
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-ink-800 border border-white/8 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 size-8 rounded-full bg-ink-700/80 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Image */}
        <div className="relative h-48 bg-gradient-to-b from-brand-900/40 to-ink-800 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent z-10" />
          <Image
            src="/rookinho-organizando.png"
            alt="Rookinho organizando"
            width={200}
            height={200}
            className="relative z-0 object-contain h-44 w-auto drop-shadow-xl"
            priority
          />
        </div>

        {/* Content */}
        <div className="px-5 pb-6 flex flex-col gap-4 -mt-3 relative z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Suas finanças merecem mais</h2>
            <p className="text-slate-400 text-xs mt-1">
              Desbloqueie tudo por apenas R$19,90/mês — cancele quando quiser.
            </p>
          </div>

          <ul className="flex flex-col gap-1.5">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs text-slate-300">
                <Icon className="size-3.5 text-brand-400 shrink-0" />
                {text}
              </li>
            ))}
          </ul>

          <Link
            href="/billing"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
          >
            <Crown className="size-4 fill-white/20" />
            Assinar PRO — R$19,90/mês
          </Link>

          <button
            onClick={() => setOpen(false)}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors text-center"
          >
            Continuar no plano gratuito
          </button>
        </div>
      </div>
    </div>
  )
}
