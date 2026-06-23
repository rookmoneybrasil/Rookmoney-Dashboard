'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Crown, Check, Minus, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'rook_upsell_shown'
const DELAY_MS    = 8_000

const COMPARISON: { label: string; free: string | boolean; pro: string | boolean; proPlus: string | boolean }[] = [
  { label: 'Transações/mês',      free: '50',  pro: 'Ilimitado', proPlus: 'Ilimitado' },
  { label: 'Contas a pagar',      free: '5',   pro: 'Ilimitado', proPlus: 'Ilimitado' },
  { label: 'Metas',               free: '2',   pro: 'Ilimitado', proPlus: 'Ilimitado' },
  { label: 'Pessoas',             free: '2',   pro: 'Ilimitado', proPlus: 'Ilimitado' },
  { label: 'Relatórios',          free: false, pro: true,        proPlus: true         },
  { label: 'Projeção financeira', free: false, pro: true,        proPlus: true         },
  { label: 'Orçamento',           free: false, pro: true,        proPlus: true         },
  { label: 'Importar CSV',        free: false, pro: true,        proPlus: true         },
  { label: 'Chat com Rookinho',   free: false, pro: '30/mês',    proPlus: 'Ilimitado'  },
  { label: 'Scanner de recibos',  free: false, pro: '20/mês',    proPlus: 'Ilimitado'  },
  { label: 'Análise financeira',  free: false, pro: '4/mês',     proPlus: 'Ilimitado'  },
]

function CellValue({ val }: { val: string | boolean }) {
  if (val === false) return <Minus className="size-3 opacity-40" />
  if (val === true)  return <Check className="size-3 text-success" />
  return <span className="text-success font-semibold text-[11px]">{val}</span>
}

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
        className="relative w-full max-w-sm bg-ink-800 border border-white/8 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-20 size-7 rounded-full bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X className="size-3.5" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex flex-col gap-4 p-5 pt-6">
          {/* Header */}
          <div>
            <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-1">
              Desbloqueie o potencial total
            </p>
            <h2 className="text-xl font-bold text-white leading-tight">
              Suas financas<br />merecem mais
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              A partir de <span className="text-white font-semibold">R$19,90/mes</span> — cancele quando quiser.
            </p>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl overflow-hidden border border-white/8 text-sm">
            <div className="grid grid-cols-4 bg-ink-700/60">
              <div className="px-2 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Recurso</div>
              <div className="px-2 py-1.5 text-[9px] font-semibold text-slate-500 uppercase tracking-wider text-center">Free</div>
              <div className="px-2 py-1.5 text-[9px] font-semibold text-amber-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                <Crown className="size-2.5 fill-amber-400/30" /> PRO
              </div>
              <div className="px-2 py-1.5 text-[9px] font-semibold text-orange-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                <Sparkles className="size-2.5" /> PRO+
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {COMPARISON.map(({ label, free, pro, proPlus }) => (
                <div key={label} className="grid grid-cols-4">
                  <div className="px-2 py-1 text-[10px] text-slate-400 leading-tight flex items-center">{label}</div>
                  <div className="px-2 py-1 text-[11px] text-center text-slate-600 flex items-center justify-center">
                    <CellValue val={free} />
                  </div>
                  <div className="px-2 py-1 text-[11px] text-center flex items-center justify-center">
                    <CellValue val={pro} />
                  </div>
                  <div className="px-2 py-1 text-[11px] text-center flex items-center justify-center">
                    <CellValue val={proPlus} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Link
              href="/billing"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/20"
            >
              <Crown className="size-4 fill-white/20" />
              Assinar PRO — R$19,90/mes
            </Link>
            <Link
              href="/billing?plan=PRO_PLUS"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-ink-900 font-bold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-orange-500/20"
            >
              <Sparkles className="size-4" />
              Assinar PRO+ — R$34,90/mes
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
