'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Crown, X, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { playProUpgrade } from '@/lib/sounds'

const PRO_PERKS = [
  'Transações, metas e contas ilimitadas',
  'Relatórios avançados e projeção financeira',
  'Chat com IA — Rookinho responde tudo',
  'Importação de extratos CSV',
  'Orçamento por categoria',
  'Suporte prioritário',
]

const PRO_PLUS_PERKS = [
  'Tudo do PRO, sem nenhum limite',
  'Chat IA ilimitado com Rookinho',
  'Scanner de recibos ilimitado',
  'Análises financeiras ilimitadas',
  'Importação de extratos ilimitada',
  'Suporte VIP prioritário',
]

export function WelcomeProModal() {
  const [open, setOpen] = useState(false)
  const [upgradedPlan, setUpgradedPlan] = useState<string>('PRO')
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('upgraded') === '1') {
      const plan = params.get('plan') === 'PRO_PLUS' ? 'PRO_PLUS' : 'PRO'
      // eslint-disable-next-line react-hooks/set-state-in-effect -- opens welcome modal in response to ?upgraded=1 URL param on mount
      setUpgradedPlan(plan)
      setOpen(true)
      playProUpgrade()
      window.fbq?.('track', 'Subscribe', { value: plan === 'PRO_PLUS' ? 34.90 : 19.90, currency: 'BRL' })
      // Evita colisão: quem acabou de assinar cai no /dashboard, mas o server pode
      // ter renderizado como FREE (webhook ainda não processou) e montado o
      // UpsellModal (timer 8s). Marcar o flag impede o "Assine o PRO" logo após o
      // "Bem-vindo ao PRO!". (Mesma STORAGE_KEY do upsell-modal.tsx.)
      try { sessionStorage.setItem('rook_upsell_shown', '1') } catch {}
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
            <div className={`size-8 rounded-xl flex items-center justify-center ${
              upgradedPlan === 'PRO_PLUS' ? 'bg-gradient-to-br from-amber-400/15 to-orange-400/15' : 'bg-amber-400/15'
            }`}>
              {upgradedPlan === 'PRO_PLUS'
                ? <Sparkles className="size-4 text-orange-400" />
                : <Crown className="size-4 text-amber-400 fill-amber-400/30" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              upgradedPlan === 'PRO_PLUS' ? 'text-orange-400' : 'text-amber-400'
            }`}>
              {upgradedPlan === 'PRO_PLUS' ? 'PRO+ Ativo' : 'PRO Ativo'}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">
              {upgradedPlan === 'PRO_PLUS' ? 'Bem-vindo ao PRO+!' : 'Bem-vindo ao PRO!'} 🎉
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {upgradedPlan === 'PRO_PLUS'
                ? 'Agora você tem acesso ilimitado a tudo — sem nenhuma restricao.'
                : 'Agora você tem acesso completo a tudo que o Rook Money tem a oferecer.'}
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {(upgradedPlan === 'PRO_PLUS' ? PRO_PLUS_PERKS : PRO_PERKS).map(p => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-slate-300">
                <div className="size-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-success" />
                </div>
                {p}
              </li>
            ))}
          </ul>

          <Button onClick={() => setOpen(false)} className="w-full mt-1">
            Começar a usar
          </Button>
        </div>
      </div>
    </div>
  )
}
