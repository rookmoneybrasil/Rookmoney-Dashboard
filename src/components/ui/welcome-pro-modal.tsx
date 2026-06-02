'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Crown, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PERKS = [
  'Transações, metas e contas ilimitadas',
  'Relatórios avançados e projeção financeira',
  'Chat com IA — Rookinho responde tudo',
  'Importação de extratos CSV',
  'Orçamento por categoria',
  'Suporte prioritário',
]

export function WelcomeProModal() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('upgraded') === '1') {
      setOpen(true)
      // Remove ?upgraded=1 from URL without reload
      router.replace('/dashboard', { scroll: false })
    }
  }, [params, router])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-ink-800 border border-amber-400/20 rounded-3xl overflow-hidden shadow-2xl shadow-amber-400/10 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 z-10 size-8 rounded-full bg-ink-700/80 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="size-4" />
        </button>

        {/* Image */}
        <div className="relative h-52 bg-gradient-to-b from-amber-400/10 to-ink-800 flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-800 via-transparent to-transparent z-10" />
          <Image
            src="/rookinho-usando-app.png"
            alt="Rookinho"
            width={200}
            height={200}
            className="relative z-0 object-contain h-48 w-auto drop-shadow-2xl"
            priority
          />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 flex flex-col gap-4 -mt-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <Crown className="size-4 text-amber-400 fill-amber-400/30" />
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">PRO Ativo</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Bem-vindo ao PRO! 🎉</h2>
            <p className="text-slate-400 text-sm mt-1">
              Agora você tem acesso completo a tudo que o Rook Money tem a oferecer.
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="size-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-success" />
                </div>
                {p}
              </li>
            ))}
          </ul>

          <Button onClick={() => setOpen(false)} className="w-full mt-1">
            Começar a usar ⚡
          </Button>
        </div>
      </div>
    </div>
  )
}
